import { ProgressManager } from '../../core/managers/ProgressManager';

export class PerformanceDashboardModel {
	getGameData() {
		// Retrieve all stored progress data
		const all = ProgressManager.getInstance().getAll();

		// Helper to safely read a game's data
		const read = (key: keyof typeof all, label: string) => {
			const g = all[key];
			return {
				label,
				played: g?.played ?? false,
				score: g?.score ?? 0,
				total: g?.total ?? 0,
				accuracy: g?.accuracy ?? 0,
				passed: g?.passed ?? false,
			};
		};

		return [
			read('earth_time', 'Earth Time Arithmetic'),
			read('mercury_main', 'Mercury Math — Main Quiz'),
			read('mercury_challenge', 'Mercury Math — Speed Challenge'),
			read('mars_prime', 'Prime Number Game'),
			read('venus', 'Venus Math Mission'),
			read('asteroid_factor', 'Asteroid Field'),
		];
	}
}
