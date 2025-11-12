import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password using bcrypt.
 *
 * @param password The plain text password to hash.
 * @returns The hashed password.
 */
export const hashPassword = async (password: string): Promise<string> => {
	const salt = await bcrypt.genSalt(SALT_ROUNDS);
	const hash = await bcrypt.hash(password, salt);
	return hash;
};

/**
 * Compares a plain text password with a hashed password.
 *
 * @param password The plain text password to compare.
 * @param hash The hashed password to compare against.
 * @returns A boolean indicating if the passwords match.
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
	return await bcrypt.compare(password, hash);
};
