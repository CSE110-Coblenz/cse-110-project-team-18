import Konva from 'konva';
import { Movement } from './Movement';
import { PlayerConfig } from '../../configs/PlayerConfig';
import { InputManager } from '../input/InputManager';

/**
 * PlayerMovement - Extends the Movement class with keyboard controls, walk/run speeds, and jump detection.
 */
export class PlayerMovement extends Movement {
	private model: { x: number; y: number };
	private walkSpeed: number; // walk speed in pixels per second
	private runSpeed: number; // run speed in pixels per second
	private enabled: boolean;
	private inputManager: InputManager;

	/**
	 * Constructor for the PlayerMovement
	 * @param model - The model of the player
	 * @param sprite - The sprite of the player
	 * @param walkSpeed - The walk speed of the player
	 * @param runSpeed - The run speed of the player
	 */
	constructor(
		model: { x: number; y: number },
		sprite: Konva.Node,
		walkSpeed: number = PlayerConfig.MOVEMENT.WALK_SPEED,
		runSpeed?: number
	) {
		super(sprite, walkSpeed);
		this.model = model;
		// Initialize position from model
		this.position.x = model.x;
		this.position.y = model.y;
		this.walkSpeed = walkSpeed;
		this.runSpeed = runSpeed ?? walkSpeed * PlayerConfig.MOVEMENT.RUN_SPEED_MULTIPLIER;
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

		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_UP)) vy = -1;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_DOWN)) vy = 1;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_LEFT)) vx = -1;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_RIGHT)) vx = 1;

		// normalize diagonal movement
		if (vx !== 0 && vy !== 0) {
			vx *= PlayerConfig.CALCULATIONS.DIAGONAL_NORMALIZER;
			vy *= PlayerConfig.CALCULATIONS.DIAGONAL_NORMALIZER;
		}

		// Use walk speed or run speed based on shift key
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
		let vx = 0;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_LEFT)) vx = -1;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_RIGHT)) vx = 1;

		// Check if there's also vertical movement for diagonal normalization
		let vy = 0;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_UP)) vy = -1;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_DOWN)) vy = 1;
		if (vx !== 0 && vy !== 0) {
			vx *= PlayerConfig.CALCULATIONS.DIAGONAL_NORMALIZER;
		}

		return vx;
	}

	/**
	 * Get the current velocity in the Y direction (normalized direction vector)
	 * @returns The current velocity in the Y direction (-1, 0, or 1)
	 */
	getVelocityY(): number {
		let vy = 0;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_UP)) vy = -1;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_DOWN)) vy = 1;

		// Check if there's also horizontal movement for diagonal normalization
		let vx = 0;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_LEFT)) vx = -1;
		if (this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_RIGHT)) vx = 1;
		if (vx !== 0 && vy !== 0) {
			vy *= PlayerConfig.CALCULATIONS.DIAGONAL_NORMALIZER;
		}

		return vy;
	}

	/**
	 * Check if space bar (jump key) is currently pressed
	 * @returns True if the space bar is currently pressed
	 */
	isJumping(): boolean {
		return this.inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.JUMP);
	}

	/**
	 * Check if shift key is pressed (for running)
	 * @returns True if the shift key is currently pressed
	 */
	isRunning(): boolean {
		return this.inputManager.isKeyPressed('shift');
	}
}
