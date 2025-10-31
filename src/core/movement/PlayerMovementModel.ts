import { PlayerConfig, PlayerConfigHelpers } from '../config/PlayerConfig';

/**
 * PlayerMovementModel - model-driven player movement
 * Updates a simple player model {x,y} based on keyboard input.
 */
export class PlayerMovementModel {
	private model: { x: number; y: number };
	private walkSpeed: number; // walk speed in pixels per second
	private runSpeed: number; // run speed in pixels per second
	private keys: Set<string>;
	private enabled: boolean;
	private boundKeyDown: (e: KeyboardEvent) => void;
	private boundKeyUp: (e: KeyboardEvent) => void;

	constructor(model: { x: number; y: number }, walkSpeed: number = PlayerConfig.MOVEMENT.WALK_SPEED, runSpeed?: number) {
		this.model = model;
		this.walkSpeed = walkSpeed;
		this.runSpeed = runSpeed ?? PlayerConfigHelpers.getDefaultRunSpeed(walkSpeed);
		this.keys = new Set();
		this.enabled = true;
		this.boundKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
		this.boundKeyUp = (e: KeyboardEvent) => this.handleKeyUp(e);
		this.setupKeyboardControls();
	}

	private setupKeyboardControls(): void {
		window.addEventListener('keydown', this.boundKeyDown);
		window.addEventListener('keyup', this.boundKeyUp);
	}

	private handleKeyDown(e: KeyboardEvent): void {
		// Handle shift key separately (it's a modifier key)
		if (PlayerConfigHelpers.isRunKey(e.key)) {
			this.keys.add('shift');
		} else {
			this.keys.add(e.key.toLowerCase());
		}
	}

	private handleKeyUp(e: KeyboardEvent): void {
		// Handle shift key separately
		if (PlayerConfigHelpers.isRunKey(e.key)) {
			this.keys.delete('shift');
		} else {
			this.keys.delete(e.key.toLowerCase());
		}
	}

	update(deltaTimeMs: number): void {
		if (!this.enabled) return;
		const dt = deltaTimeMs / 1000; // convert to seconds

		let vx = 0;
		let vy = 0;

		if (PlayerConfig.CONTROLS.MOVE_UP.some(key => this.keys.has(key.toLowerCase()))) vy = -1;
		if (PlayerConfig.CONTROLS.MOVE_DOWN.some(key => this.keys.has(key.toLowerCase()))) vy = 1;
		if (PlayerConfig.CONTROLS.MOVE_LEFT.some(key => this.keys.has(key.toLowerCase()))) vx = -1;
		if (PlayerConfig.CONTROLS.MOVE_RIGHT.some(key => this.keys.has(key.toLowerCase()))) vx = 1;

		// normalize diagonal movement
		if (vx !== 0 && vy !== 0) {
			vx *= PlayerConfig.CALCULATIONS.DIAGONAL_NORMALIZER;
			vy *= PlayerConfig.CALCULATIONS.DIAGONAL_NORMALIZER;
		}

		// Use walk speed or run speed based on shift key
		const isRunning = this.isRunning();
		const currentSpeed = isRunning ? this.runSpeed : this.walkSpeed;

		this.model.x += vx * currentSpeed * dt;
		this.model.y += vy * currentSpeed * dt;
	}

	getModel() {
		return this.model;
	}

	setEnabled(v: boolean) {
		this.enabled = v;
	}

	dispose(): void {
		window.removeEventListener('keydown', this.boundKeyDown);
		window.removeEventListener('keyup', this.boundKeyUp);
	}

	/**
	 * Get the current velocity in the X direction (normalized direction vector)
	 * Returns -1, 0, or 1 based on key presses
	 */
	getVelocityX(): number {
		let vx = 0;
		if (PlayerConfig.CONTROLS.MOVE_LEFT.some(key => this.keys.has(key.toLowerCase()))) vx = -1;
		if (PlayerConfig.CONTROLS.MOVE_RIGHT.some(key => this.keys.has(key.toLowerCase()))) vx = 1;
		
		// Check if there's also vertical movement for diagonal normalization
		let vy = 0;
		if (PlayerConfig.CONTROLS.MOVE_UP.some(key => this.keys.has(key.toLowerCase()))) vy = -1;
		if (PlayerConfig.CONTROLS.MOVE_DOWN.some(key => this.keys.has(key.toLowerCase()))) vy = 1;
		if (vx !== 0 && vy !== 0) {
			vx *= PlayerConfig.CALCULATIONS.DIAGONAL_NORMALIZER;
		}
		
		return vx;
	}

	/**
	 * Get the current velocity in the Y direction (normalized direction vector)
	 * Returns -1, 0, or 1 based on key presses
	 */
	getVelocityY(): number {
		let vy = 0;
		if (PlayerConfig.CONTROLS.MOVE_UP.some(key => this.keys.has(key.toLowerCase()))) vy = -1;
		if (PlayerConfig.CONTROLS.MOVE_DOWN.some(key => this.keys.has(key.toLowerCase()))) vy = 1;
		
		// Check if there's also horizontal movement for diagonal normalization
		let vx = 0;
		if (PlayerConfig.CONTROLS.MOVE_LEFT.some(key => this.keys.has(key.toLowerCase()))) vx = -1;
		if (PlayerConfig.CONTROLS.MOVE_RIGHT.some(key => this.keys.has(key.toLowerCase()))) vx = 1;
		if (vx !== 0 && vy !== 0) {
			vy *= PlayerConfig.CALCULATIONS.DIAGONAL_NORMALIZER;
		}
		
		return vy;
	}

	/**
	 * Check if space bar (jump key) is currently pressed
	 */
	isJumping(): boolean {
		return PlayerConfig.CONTROLS.JUMP.some(key => this.keys.has(key));
	}

	/**
	 * Check if shift key is pressed (for running)
	 */
	isRunning(): boolean {
		return this.keys.has('shift');
	}
}
