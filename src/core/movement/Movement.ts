import Konva from 'konva';

/**
 * Base Movement class that handles basic movement mechanics
 * Can be extended for specific movement types (player, planets, etc.)
 */
export class Movement {
	protected sprite: Konva.Node;
	protected speed: number;
	protected position: { x: number; y: number };

	/**
	 * Constructor for the Movement
	 * @param sprite - The sprite of the movement
	 * @param speed - The speed of the movement
	 */
	constructor(sprite: Konva.Node, speed: number) {
		this.sprite = sprite;
		this.speed = speed;
		this.position = {
			x: sprite.x(),
			y: sprite.y(),
		};
	}

	/**
	 * Update position based on delta time
	 * @param deltaTime Time elapsed since last update in milliseconds
	 */
	update(_deltaTime: number): void {
		// Base update method - to be overridden by specific movement types
		// `_deltaTime` is intentionally unused in the base implementation;
		// derived classes may use it when overriding.
		this.sprite.x(this.position.x);
		this.sprite.y(this.position.y);
	}

	/**
	 * Set the movement speed
	 * @param speed New speed value
	 */
	setSpeed(speed: number): void {
		this.speed = speed;
	}

	/**
	 * Get current position
	 */
	getPosition(): { x: number; y: number } {
		return { x: this.position.x, y: this.position.y };
	}

	/**
	 * Set position directly
	 */
	setPosition(x: number, y: number): void {
		this.position.x = x;
		this.position.y = y;
		this.update(0);
	}

	/**
	 * Get the current velocity in the X direction (normalized direction vector)
	 * Default implementation returns 0. Override in subclasses that support keyboard input.
	 * @returns The current velocity in the X direction (-1, 0, or 1)
	 */
	getVelocityX(): number {
		return 0;
	}

	/**
	 * Get the current velocity in the Y direction (normalized direction vector)
	 * Default implementation returns 0. Override in subclasses that support keyboard input.
	 * @returns The current velocity in the Y direction (-1, 0, or 1)
	 */
	getVelocityY(): number {
		return 0;
	}

	/**
	 * Check if jump key is currently pressed
	 * Default implementation returns false. Override in subclasses that support jumping.
	 * @returns True if the jump key is currently pressed
	 */
	isJumping(): boolean {
		return false;
	}

	/**
	 * Check if run key is pressed
	 * Default implementation returns false. Override in subclasses that support running.
	 * @returns True if the run key is currently pressed
	 */
	isRunning(): boolean {
		return false;
	}

	/**
	 * Dispose of the movement
	 * Default implementation does nothing. Override in subclasses that need cleanup.
	 */
	dispose(): void {
		// No cleanup needed by default
	}
}