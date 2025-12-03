// src/server/server.ts

import express from 'express';
import cors from 'cors';

import { createUser, loginUser } from '../src/db/userManager.ts';
import { getUnlockedPlanets, savePlanetScore } from '../src/db/savedataManager.ts';

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

// ---------- PROGRESS: GET UNLOCKED PLANETS ----------
app.get('/api/progress/unlocked-planets/:userId', (req, res) => {
	const userId = Number(req.params.userId);
	if (!userId) {
		return res.status(400).json({ error: 'Invalid user ID' });
	}

	const unlocked = getUnlockedPlanets(userId);
	console.log(`[unlocked-planets] user=${userId} =>`, unlocked);

	return res.json({ unlockedPlanets: unlocked });
});

// ---------- PROGRESS: UPDATE SCORE FOR A PLANET ----------
app.post('/api/progress/update-score', (req, res) => {
	const { userId, planetId, score } = req.body ?? {};

	const uid = Number(userId);
	const pid = Number(planetId);
	const sc = Number(score);

	if (!uid || !pid || Number.isNaN(sc)) {
		return res.status(400).json({ success: false, message: 'Invalid userId / planetId / score' });
	}

	console.log(`[/api/progress/update-score] user=${uid}, planetId=${pid}, score=${sc}`);

	savePlanetScore(uid, sc, pid);

	return res.json({ success: true });
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
	console.log(`Auth server listening on http://localhost:${PORT}`);
});
