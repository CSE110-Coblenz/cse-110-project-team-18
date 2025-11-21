import db from 'src/db/connection.ts';
import { hashPassword, comparePassword } from 'src/db/utils/bcrypt.ts';

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
 * @param id The unique identifier of the user.
 * @returns The User object if found, otherwise null.
 */
export function getUserByID(id: number): User | null {
	const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
	const user = stmt.get(id) as User | null;
	return user;
}

/**
 * Creates a new user with the provided username and password.
 *
 * @param username The desired username for the new user.
 * @param password The password for the new user.
 * @returns The ID of the newly created user.
 */
export async function createUser(username: string, password: string): Promise<number> {
	const hashedPassword = await hashPassword(password);
	const stmt = db.prepare(
		'INSERT INTO users (username, password, lvl, score, current_planet_id) VALUES (?, ?, 1, 0, 1)'
	);
	const info = stmt.run(username, hashedPassword);
	return info.lastInsertRowid as number;
}

/**
 * Attempts to log in a user with any given username and password.
 *
 * @param username The username of the user attempting to log in.
 * @param password The password provided for authentication.
 * @returns The User object if login is successful, otherwise null.
 */
export async function loginUser(username: string, password: string): Promise<User | null> {
	const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
	const user = stmt.get(username) as User | null;
	if (user && (await comparePassword(password, user.password))) {
		return user;
	}
	return null;
}
