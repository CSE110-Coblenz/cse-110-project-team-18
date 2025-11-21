import Database from 'better-sqlite3';
const db = new Database('data/game_data.db');

db.pragma('journal_mode = WAL'); // Enable Write-Ahead Logging for better concurrency
db.pragma('foreign_keys = ON'); // Enforce foreign key constraints

/**
 * Initializes user progress for all planets (0 for the first
 * planet, null for others) upon user creation.
 * 
 * @param userId user ID of newly created user
 */
export function initializeUserProgress(userId: number): void {
    const planets = db.prepare(
        'SELECT id FROM planets ORDER BY planet_id').all() as { planet_id: number }[];
    const stmt = db.prepare('INSERT INTO user_progress (user_id, planet_id, score) VALUES (?, ?, ?)');

    planets.forEach((planets, index) => {
        const score = index === 0 ? 0 : null; // Unlock first planet with score 0
        stmt.run(userId, planets.planet_id, score);
    });
}

export default db;
