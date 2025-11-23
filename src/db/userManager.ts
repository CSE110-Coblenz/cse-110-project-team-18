import db from 'src/db/connection.ts';
import { hashPassword, comparePassword } from 'src/db/utils/bcrypt.ts';
import { initializeUserProgress, startAutoSave } from 'src/db/savedataManager.ts';

export interface User {
	id: number;
	username: string;
	password: string;
	lvl: number;
	score: number;
	current_planet_id: number;
}

/**
 * Retrieves a user by their unique ID.
 *
 * @param id the unique identifier of the user.
 * @returns the User object if found, otherwise null.
 */
export function getUserByID(id: number): User | null {
	const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
	const user = stmt.get(id) as User | null;
	return user;
}

/**
 * Creates a new user with the provided username and password.
 * Also calls initializeUserProgress to set up initial progress.
 *
 * @param username the desired username for the new user.
 * @param password the password for the new user.
 * @returns the ID of the newly created user.
 */
export async function createUser(username: string, password: string): Promise<number> {
	const hashedPassword = await hashPassword(password);
	const stmt = db.prepare(
		'INSERT INTO users (username, password, lvl, score, current_planet_id) VALUES (?, ?, 1, 0, 1)'
	);
	const info = stmt.run(username, hashedPassword);
	const userID = info.lastInsertRowid as number;

	// Initialize user progress
	initializeUserProgress(userID);

	return userID;
}

/**
 * Attempts to log in a user with any given username and password.
 *
 * @param username the username of the user attempting to log in.
 * @param password the password provided for authentication.
 * @returns the User object if login is successful, otherwise null.
 */
export async function loginUser(username: string, password: string): Promise<User | null> {
	const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
	const user = stmt.get(username) as User | null;
	if (user && (await comparePassword(password, user.password))) {
		startAutoSave(user.id);
		return user;
	}
	return null;
}

/**
 * Changes the current planet that the user is on.
 *
 * @param userId the current user ID.
 * @param planetId the ID of the new current planet for the user.
 */
export function changeUserCurrentPlanet(userId: number, planetId: number): void {
	const stmt = db.prepare('UPDATE users SET current_planet_id = ? WHERE id = ?');
	stmt.run(planetId, userId);
}

/**
 * Get the current planet ID for the user.
 *
 * @param userId the current user ID .
 * @returns the ID of the current planet the user is on.
 */
export function getUserCurrentPlanet(userId: number): number | null {
	const stmt = db.prepare('SELECT current_planet_id FROM users WHERE id = ?');
	const row = stmt.get(userId) as { current_planet_id: number } | null;
	return row ? (row.current_planet_id as number) : null;
}
