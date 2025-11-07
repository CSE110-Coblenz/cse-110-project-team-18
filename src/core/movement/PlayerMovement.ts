import Konva from 'konva';
import { Movement } from './Movement';
import { InputManager } from '../input/InputManager';
import { MovementConfig, DEFAULT_MOVEMENT_CONFIG } from '../../configs/MovementConfig';

/**
 * PlayerMovement - Extends the Movement class with configurable keyboard controls, walk/run speeds, and jump detection.
 * Supports customizable key bindings and movement constraints (e.g., horizontal-only, vertical-only, or full 4-directional).
 */
export class PlayerMovement extends Movement {
	private model: { x: number; y: number };
	private config: MovementConfig;
	private walkSpeed: number; // walk speed in pixels per second
	private runSpeed: number; // run speed in pixels per second
	private enabled: boolean;
	private inputManager: InputManager;

	/**
	 * Constructor for the PlayerMovement
	 * @param model - The model of the player
	 * @param sprite - The sprite of the player
	 * @param config - Movement configuration with key bindings and settings
	 */
	constructor(model: { x: number; y: number }, sprite: Konva.Node, config: MovementConfig) {
		super(sprite, config.walkSpeed);
		this.model = model;
		// Initialize position from model
		this.position.x = model.x;
		this.position.y = model.y;
		this.config = { ...DEFAULT_MOVEMENT_CONFIG, ...config };
		this.walkSpeed = this.config.walkSpeed;
		this.runSpeed =
			this.config.runSpeed ??
			this.walkSpeed *
				(this.config.runSpeedMultiplier ?? DEFAULT_MOVEMENT_CONFIG.runSpeedMultiplier!);
		this.enabled = true;
		this.inputManager = InputManager.getInstance();
	}

	/**
	 * Update the player movement
	 * @param deltaTimeMs - The time since the last frame in milliseconds
	 */
	override update(deltaTimeMs: number): void {
		if (!this.enabled) return;
		const dt = deltaTimeMs / 1000; // convert to seconds

		let vx = 0;
		let vy = 0;

		// Check horizontal movement keys if enabled
		if (this.config.enableHorizontalMovement !== false) {
			if (this.config.keys.left && this.inputManager.isAnyKeyPressed(this.config.keys.left))
				vx = -1;
			if (this.config.keys.right && this.inputManager.isAnyKeyPressed(this.config.keys.right))
				vx = 1;
		}

		// Check vertical movement keys if enabled
		if (this.config.enableVerticalMovement !== false) {
			if (this.config.keys.up && this.inputManager.isAnyKeyPressed(this.config.keys.up)) vy = -1;
			if (this.config.keys.down && this.inputManager.isAnyKeyPressed(this.config.keys.down)) vy = 1;
		}

		// Normalize diagonal movement if enabled and both directions are active
		if (this.config.enableDiagonalNormalization !== false && vx !== 0 && vy !== 0) {
			const diagonalNormalizer = 1 / Math.sqrt(2);
			vx *= diagonalNormalizer;
			vy *= diagonalNormalizer;
		}

		// Use walk speed or run speed based on run key
		const isRunning = this.isRunning();
		const currentSpeed = isRunning ? this.runSpeed : this.walkSpeed;

		// Update external model (model-driven architecture)
		this.model.x += vx * currentSpeed * dt;
		this.model.y += vy * currentSpeed * dt;

		// Update base class position for compatibility (though sprite sync happens elsewhere)
		this.position.x = this.model.x;
		this.position.y = this.model.y;

		// In model-driven architecture, sprite sync happens in Player.update()
	}

	/**
	 * Get the external model
	 * @returns The external model
	 */
	getModel(): { x: number; y: number } {
		return this.model;
	}

	/**
	 * Set the enabled state of the player movement
	 * @param v - The enabled state
	 */
	setEnabled(v: boolean) {
		this.enabled = v;
	}

	/**
	 * Dispose of the player movement
	 */
	dispose(): void {
		// No cleanup needed - InputManager handles all event listeners centrally
	}

	/**
	 * Get the current velocity in the X direction (normalized direction vector)
	 * @returns The current velocity in the X direction (-1, 0, or 1)
	 */
	getVelocityX(): number {
		if (this.config.enableHorizontalMovement === false) return 0;

		let vx = 0;
		if (this.config.keys.left && this.inputManager.isAnyKeyPressed(this.config.keys.left)) vx = -1;
		if (this.config.keys.right && this.inputManager.isAnyKeyPressed(this.config.keys.right)) vx = 1;

		// Check if there's also vertical movement for diagonal normalization
		if (this.config.enableDiagonalNormalization !== false) {
			let vy = 0;
			if (this.config.enableVerticalMovement !== false) {
				if (this.config.keys.up && this.inputManager.isAnyKeyPressed(this.config.keys.up)) vy = -1;
				if (this.config.keys.down && this.inputManager.isAnyKeyPressed(this.config.keys.down))
					vy = 1;
			}
			if (vx !== 0 && vy !== 0) {
				const diagonalNormalizer = 1 / Math.sqrt(2);
				vx *= diagonalNormalizer;
			}
		}

		return vx;
	}

	/**
	 * Get the current velocity in the Y direction (normalized direction vector)
	 * @returns The current velocity in the Y direction (-1, 0, or 1)
	 */
	getVelocityY(): number {
		if (this.config.enableVerticalMovement === false) return 0;

		let vy = 0;
		if (this.config.keys.up && this.inputManager.isAnyKeyPressed(this.config.keys.up)) vy = -1;
		if (this.config.keys.down && this.inputManager.isAnyKeyPressed(this.config.keys.down)) vy = 1;

		// Check if there's also horizontal movement for diagonal normalization
		if (this.config.enableDiagonalNormalization !== false) {
			let vx = 0;
			if (this.config.enableHorizontalMovement !== false) {
				if (this.config.keys.left && this.inputManager.isAnyKeyPressed(this.config.keys.left))
					vx = -1;
				if (this.config.keys.right && this.inputManager.isAnyKeyPressed(this.config.keys.right))
					vx = 1;
			}
			if (vx !== 0 && vy !== 0) {
				const diagonalNormalizer = 1 / Math.sqrt(2);
				vy *= diagonalNormalizer;
			}
		}

		return vy;
	}

	/**
	 * Check if jump key is currently pressed
	 * @returns True if the jump key is currently pressed
	 */
	isJumping(): boolean {
		if (!this.config.enableJumping || !this.config.jumpKeys) return false;
		return this.inputManager.isAnyKeyPressed(this.config.jumpKeys);
	}

	/**
	 * Check if run key is pressed
	 * @returns True if the run key is currently pressed
	 */
	isRunning(): boolean {
		if (!this.config.runKeys) return false;
		return this.inputManager.isAnyKeyPressed(this.config.runKeys);
	}
}
