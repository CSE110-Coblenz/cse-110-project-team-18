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

/**
 * Helper functions for player configuration
 */
export const PlayerConfigHelpers = {
	/**
	 * Get default run speed based on walk speed
	 */
	getDefaultRunSpeed(walkSpeed: number): number {
		return walkSpeed * PlayerConfig.MOVEMENT.RUN_SPEED_MULTIPLIER;
	},

	/**
	 * Check if a key is a movement key
	 */
	isMovementKey(key: string): boolean {
		const keyLower = key.toLowerCase();
		return [
			...PlayerConfig.CONTROLS.MOVE_UP,
			...PlayerConfig.CONTROLS.MOVE_DOWN,
			...PlayerConfig.CONTROLS.MOVE_LEFT,
			...PlayerConfig.CONTROLS.MOVE_RIGHT,
		]
			.map((k) => k.toLowerCase())
			.includes(keyLower);
	},

	/**
	 * Check if a key is a run key (shift)
	 */
	isRunKey(key: string): boolean {
		return PlayerConfig.CONTROLS.RUN.includes(key as any);
	},

	/**
	 * Check if a key is the jump key (space)
	 */
	isJumpKey(key: string): boolean {
		return PlayerConfig.CONTROLS.JUMP.includes(key as any);
	},
} as const;
