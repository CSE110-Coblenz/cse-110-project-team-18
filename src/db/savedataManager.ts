import db from './connection.ts';
import { getUserCurrentPlanet } from './userManager.ts';

// SAVE_INTERVAL_MS = n minutes * 60 seconds/minute * 1000 milliseconds/second
const SAVE_INTERVAL_MS: number = 5 * 60 * 1000; // 5 minutes

const activeAutoSaves: Map<number, NodeJS.Timeout> = new Map(); // store active auto-saves

// === USER PROGRESS MANAGEMENT ===
/**
 * Saves the current score for a specific planet for a user.
 *
 * Semantics:
 *   score = NULL  -> planet is locked
 *   score = 0     -> planet is unlocked but not completed
 *   score > 0     -> planet completed; next planet should unlock (score=0)
 *
 * @param userId the current user ID.
 * @param score the current score to save.
 * @param planet_id the planet ID being updated.
 */
export function savePlanetScore(userId: number, score: number, planet_id: number): void {
	console.log(`[savePlanetScore] user=${userId}, planet_id=${planet_id}, score=${score}`);

	const stmt = db.prepare('UPDATE user_progress SET score = ? WHERE id = ? AND planet_id = ?');
	// IMPORTANT: parameter order is score, id, planet_id
	stmt.run(score, userId, planet_id);

	// If this planet is now completed (score > 0), unlock the next planet.
	if (score > 0) {
		const nextPlanetId = planet_id + 1;

		console.log(
			`[savePlanetScore] attempting to unlock next planet (${nextPlanetId}) for user ${userId}`
		);

		const unlockNextStmt = db.prepare(
			`UPDATE user_progress
             SET score = 0
             WHERE id = ?
               AND planet_id = ?
               AND score IS NULL`
		);

		unlockNextStmt.run(userId, nextPlanetId);
	}
}

/**
 * Gets the current saved score and planet ID for a user.
 *
 * @param userId the current user ID.
 * @returns An object containing score and planet_id, or null if not found (i.e.,
 * planet is locked).
 */
export function getCurrentPlanetScore(userId: number): { score: number; planet_id: number } | null {
	// get current planet ID
	const planetId = getUserCurrentPlanet(userId);
	if (!planetId) return null;

	// use that ID to get score
	const stmt = db.prepare(
		'SELECT score, planet_id FROM user_progress WHERE id = ? AND planet_id = ?'
	);
	const data = stmt.get(userId, planetId) as { score: number; planet_id: number } | null;
	return data;
}

/**
 * Gets a list of unlocked planet IDs for the user.
 *
 * @param userId the current user ID.
 * @returns an array of unlocked planet IDs.
 *
 * NOTE:
 *   This considers planets "unlocked" if score IS NOT NULL
 *   (i.e., score = 0 or score > 0).
 */
export function getUnlockedPlanets(userId: number): number[] {
	const stmt = db.prepare(
		`SELECT planet_id, score
         FROM user_progress
         WHERE id = ?
         ORDER BY planet_id`
	);
	const rows = stmt.all(userId) as { planet_id: number; score: number | null }[];

	const unlocked = new Set<number>();

	// Mercury is always unlocked as the starting planet
	unlocked.add(1);

	for (const row of rows) {
		// only counts as "cleared" if score is > 0
		if (row.score !== null && row.score > 0) {
			const nextPlanet = row.planet_id + 1;
			unlocked.add(nextPlanet);
		}
	}

	// You can optionally also add the cleared planet itself:
	// if (row.score !== null && row.score > 0) unlocked.add(row.planet_id);

	return Array.from(unlocked).sort((a, b) => a - b);
}

/**
 * Gets the planet ID given its name (case insensitive).
 *
 * @param planetName the name of the planet.
 * @returns the planet ID, or null if not found.
 */
export function getPlanetIdByName(planetName: string): number | null {
	const stmt = db.prepare('SELECT planet_id FROM planets WHERE name = ? COLLATE NOCASE');
	const row = stmt.get(planetName) as { planet_id: number } | null;
	return row ? row.planet_id : null;
}

/**
 * Initializes user progress for all planets (0 for the first
 * planet, null for others) upon user creation.
 *
 * @param userId user ID of newly created user.
 */
export function initializeUserProgress(userId: number): void {
	const planets = db.prepare('SELECT planet_id FROM planets ORDER BY planet_id').all() as {
		planet_id: number;
	}[];
	const stmt = db.prepare('INSERT INTO user_progress (id, planet_id, score) VALUES (?, ?, ?)');

	planets.forEach((planets, index) => {
		// Mercury (planet_id=1, index=0) is unlocked with score 0.
		// All others start locked (score = NULL).
		const score = index === 0 ? 0 : null;
		stmt.run(userId, planets.planet_id, score);
	});
}

/**
 * Saves the current user's progress.
 * Manual call when switching planets or logging out.
 *
 * IMPORTANT:
 *   This assumes your game logic has already updated the score
 *   for the current planet in the DB or in memory before calling save().
 *
 * @param userId the current user ID.
 */
export function save(userId: number): void {
	const currentPlanet = getUserCurrentPlanet(userId);
	if (currentPlanet === null) return; // erroneous call

	const currentData = getCurrentPlanetScore(userId);
	if (currentData === null) return; // no data to save

	savePlanetScore(userId, currentData.score, currentPlanet);
}

/**
 * Unlocks new planet for user. Call before changing current planet
 * 
 * @param userId the current user ID.
 * @param planetId the planet ID to unlock.
 */
export function unlockPlanetForUser(userId: number, planetId: number): void {
	const unlockedPlanets = getUnlockedPlanets(userId);
	if (planetId <= 0 || unlockedPlanets.includes(planetId)) return; // invalid or already unlocked

	savePlanetScore(userId, 0, planetId); 
}


// === AUTOSAVE ===

/**
 * Starts the auto-save interval for the current user.
 *
 * @param userId the current user ID.
 */
export function startAutoSave(userId: number): void {
	// prevent multiple auto-saves for same user
	if (activeAutoSaves.has(userId)) {
		console.warn(`⚠️ Auto-save already active for user ID ${userId}!`);
		return;
	}

	// set interval to auto-save
	const intervalId = setInterval(() => {
		save(userId);
		console.log(`💾 Auto-saved data for user ID ${userId}!`);
	}, SAVE_INTERVAL_MS);
	activeAutoSaves.set(userId, intervalId);
}

/**
 * Stops the auto-save interval for the current user.
 * Manually called on logout.
 *
 * @param userId the current user ID.
 */
export function stopAutoSave(userId: number): void {
	const interval = activeAutoSaves.get(userId);
	if (interval) {
		clearInterval(interval);
		activeAutoSaves.delete(userId);
		console.log(`🛑 Stopped auto-save for user ID ${userId}!`);
	} else {
		console.warn(`⚠️ No active auto-save found for user ID ${userId}!`);
	}
}
