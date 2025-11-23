import db from 'src/db/connection.ts';
import { getUserCurrentPlanet } from 'src/db/userManager.ts';

// SAVE_INTERVAL_MS = n minutes * 60 seconds/minute * 1000 milliseconds/second
const SAVE_INTERVAL_MS: number = 5 * 60 * 1000; // 5 minutes

const activeAutoSaves: Map<number, NodeJS.Timeout> = new Map(); // store active auto-saves

// === USER PROGRESS MANAGEMENT ===
/**
 * Saves the current score and planet ID for a user.
 *
 * @param userId the current user ID.
 * @param score the current score to save.
 * @param planet_id the current planet ID.
 */
function savePlanetScore(userId: number, score: number, planet_id: number): void {
	const stmt = db.prepare('UPDATE user_progress SET score = ? WHERE id = ? AND planet_id = ?');
	stmt.run(score, planet_id, userId);
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
 */
export function getUnlockedPlanets(userId: number): number[] {
	const stmt = db.prepare(
		`SELECT DISTINCT up.planet_id
         FROM user_progress up
         WHERE up.id = ? AND up.score IS NOT NULL
         ORDER BY up.planet_id`
	);
	const rows = stmt.all(userId) as { planet_id: number }[];
	return rows.map((r) => r.planet_id);
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
		const score = index === 0 ? 0 : null; // Unlock first planet with score 0
		stmt.run(userId, planets.planet_id, score);
	});
}

/**
 * Saves the current user's progress.
 * Manual call when switching planets or logging out.
 *
 * @param userId the current user ID.
 */
export function save(userId: number): void {
	const currentPlanet = getUserCurrentPlanet(userId);
	if (currentPlanet === null) return; // erronious call

	const currentData = getCurrentPlanetScore(userId);
	if (currentData === null) return; // no data to save

	savePlanetScore(userId, currentData.score, currentPlanet);
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
 * Stops the auto-save inteerval for the current user.
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
