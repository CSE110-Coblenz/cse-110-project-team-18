/**
 * MovementConfig - Configuration for player movement with customizable key bindings
 * @param keys - Key bindings for movement directions
 * @param walkSpeed - Walk speed in pixels per second
 * @param runSpeed - Run speed in pixels per second (optional, defaults to walkSpeed * multiplier)
 * @param runSpeedMultiplier - Multiplier for run speed when run key is pressed (defaults to 2.0)
 * @param runKeys - Keys that trigger running mode (defaults to ['shift'])
 * @param enableHorizontalMovement - Whether horizontal (left/right) movement is enabled (defaults to true)
 * @param enableVerticalMovement - Whether vertical (up/down) movement is enabled (defaults to true)
 * @param enableDiagonalNormalization - Whether to normalize diagonal movement (defaults to true)
 * @param enableJumping - Whether jumping is enabled (defaults to false)
 * @param jumpKeys - Keys that trigger jumping (optional, only used if enableJumping is true)
 */
export interface MovementConfig {
	keys: {
		up?: readonly string[]; // Keys for moving up (e.g., ['w', 'arrowup'])
		down?: readonly string[]; // Keys for moving down (e.g., ['s', 'arrowdown'])
		left?: readonly string[]; // Keys for moving left (e.g., ['a', 'arrowleft'])
		right?: readonly string[]; // Keys for moving right (e.g., ['d', 'arrowright'])
	};
	walkSpeed: number;
	runSpeed?: number;
	runSpeedMultiplier?: number;
	runKeys?: readonly string[];
	enableHorizontalMovement?: boolean;
	enableVerticalMovement?: boolean;
	enableDiagonalNormalization?: boolean;
	enableJumping?: boolean;
	jumpKeys?: readonly string[];
}

/**
 * Default movement configuration values
 */
export const DEFAULT_MOVEMENT_CONFIG: Partial<MovementConfig> = {
	runSpeedMultiplier: 2.0,
	runKeys: ['shift', 'Shift', 'ShiftLeft', 'ShiftRight'],
	enableHorizontalMovement: true,
	enableVerticalMovement: true,
	enableDiagonalNormalization: true,
	enableJumping: false,
	jumpKeys: [' '],
};

/**
 * Create a horizontal-only movement config (A/D keys only)
 * @param walkSpeed - Walk speed in pixels per second
 * @param runSpeed - Optional run speed (defaults to walkSpeed * 2.0)
 */
export function createHorizontalMovementConfig(
	walkSpeed: number,
	runSpeed?: number
): MovementConfig {
	return {
		keys: {
			left: ['a'], // Only A key for left
			right: ['d'], // Only D key for right
		},
		walkSpeed,
		runSpeed,
		enableHorizontalMovement: true,
		enableVerticalMovement: false, // Disable vertical movement
		enableDiagonalNormalization: false, // Not needed for horizontal-only
		enableJumping: false,
	};
}