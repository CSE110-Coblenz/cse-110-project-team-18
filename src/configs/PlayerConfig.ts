/**
 * Player configuration constants
 * Centralized configuration for player movement, controls, and behavior
 */
export const PlayerConfig = {
	// Movement speeds (in pixels per second)
	MOVEMENT: {
		WALK_SPEED: 150,
		RUN_SPEED_MULTIPLIER: 2.0, // runSpeed = walkSpeed * this
	},

	// Input controls
	CONTROLS: {
		MOVE_UP: ['w', 'arrowup'],
		MOVE_DOWN: ['s', 'arrowdown'],
		MOVE_LEFT: ['a', 'arrowleft'],
		MOVE_RIGHT: ['d', 'arrowright'],
		JUMP: [' '],
		RUN: ['shift', 'Shift', 'ShiftLeft', 'ShiftRight'],
	},

	// Default values for PlayerManager
	MANAGER: {
		DEFAULT_SCALE: 1,
		DEFAULT_Y_POSITION: 300,
		DEFAULT_FRAME_RATE: 8,
	},

	// Movement calculations
	CALCULATIONS: {
		DIAGONAL_NORMALIZER: 1 / Math.sqrt(2),
		MIN_VELOCITY_THRESHOLD: 0.1, // below this is considered "idle"
	},
} as const;
