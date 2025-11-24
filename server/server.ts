// src/server/server.ts

import express from 'express';
import cors from 'cors';

import { createUser, loginUser } from '../src/db/userManager.ts';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // allow calls from your frontend dev server
app.use(express.json()); // parse JSON bodies

// ---------- CREATE ACCOUNT ----------
app.post('/api/create-account', async (req, res) => {
	const { username, password } = req.body as {
		username?: string;
		password?: string;
	};

	if (!username || !password) {
		return res.status(400).json({
			success: false,
			message: 'Username and password are required',
		});
	}

	try {
		// This should:
		//  - insert into `users`
		//  - initialize `user_progress` with planet 1 unlocked
		const userId = await createUser(username, password);

		// Optional: immediately log the user in so autosave starts
		const user = await loginUser(username, password);
		if (!user) {
			return res.status(500).json({
				success: false,
				message: 'User created but could not log in.',
			});
		}

		return res.json({
			success: true,
			message: 'Account created',
			user: {
				id: user.id,
				username: user.username,
			},
		});
	} catch (err) {
		console.error('[create-account] error', err);
		// If createUser throws for duplicate username, we map that here:
		return res.status(400).json({
			success: false,
			message: 'Username already exists',
		});
	}
});

// ---------- LOGIN ----------
app.post('/api/login', async (req, res) => {
	const { username, password } = req.body as {
		username?: string;
		password?: string;
	};

	if (!username || !password) {
		return res.status(400).json({
			success: false,
			message: 'Username and password are required',
		});
	}

	try {
		const user = await loginUser(username, password);

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid username or password',
			});
		}

		return res.json({
			success: true,
			message: 'Login successful',
			user: {
				id: user.id,
				username: user.username,
			},
		});
	} catch (err) {
		console.error('[login] error', err);
		return res.status(500).json({
			success: false,
			message: 'Server error while logging in',
		});
	}
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
	console.log(`Auth server listening on http://localhost:${PORT}`);
});
