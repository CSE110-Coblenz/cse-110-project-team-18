/**
 * Player configuration constants
 * Centralized configuration for shared, abstract player settings
 *
 * Note: Per-player settings (walk speed, scale, frame rate, etc.) should be defined
 * during player initialization via MovementConfig and PlayerManagerOptions.
 */
export const PlayerConfig = {
	// Input controls - shared key bindings used across all players
	CONTROLS: {
		MOVE_UP: ['w', 'arrowup'],
		MOVE_DOWN: ['s', 'arrowdown'],
		MOVE_LEFT: ['a', 'arrowleft'],
		MOVE_RIGHT: ['d', 'arrowright'],
		JUMP: [' '],
		RUN: ['shift', 'Shift', 'ShiftLeft', 'ShiftRight'],
	},

	// Movement calculations - shared mathematical constants
	CALCULATIONS: {
		DIAGONAL_NORMALIZER: 1 / Math.sqrt(2),
		MIN_VELOCITY_THRESHOLD: 0.1, // below this is considered "idle"
	},
} as const;
