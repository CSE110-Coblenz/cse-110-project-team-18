import Konva from 'konva';
import { Movement } from './Movement';

/**
 * Handles player-specific movement mechanics
 * Extends base Movement class with keyboard controls
 */
export class PlayerMovement extends Movement {
	private velocity: { x: number; y: number };
	private keys: Set<string>;

	constructor(sprite: Konva.Node, speed: number = 5) {
		super(sprite, speed);
		this.velocity = { x: 0, y: 0 };
		this.keys = new Set();

		// Set up keyboard listeners
		this.setupKeyboardControls();
	}

	private setupKeyboardControls(): void {
		window.addEventListener('keydown', (e) => this.handleKeyDown(e));
		window.addEventListener('keyup', (e) => this.handleKeyUp(e));
	}

	private handleKeyDown(e: KeyboardEvent): void {
		this.keys.add(e.key.toLowerCase());
	}

	private handleKeyUp(e: KeyboardEvent): void {
		this.keys.delete(e.key.toLowerCase());
	}

	override update(deltaTime: number): void {
		// Reset velocity
		this.velocity.x = 0;
		this.velocity.y = 0;

		// Update velocity based on keyboard input
		if (this.keys.has('w') || this.keys.has('arrowup')) this.velocity.y = -1;
		if (this.keys.has('s') || this.keys.has('arrowdown')) this.velocity.y = 1;
		if (this.keys.has('a') || this.keys.has('arrowleft')) this.velocity.x = -1;
		if (this.keys.has('d') || this.keys.has('arrowright')) this.velocity.x = 1;

		// Normalize diagonal movement
		if (this.velocity.x !== 0 && this.velocity.y !== 0) {
			const normalizer = 1 / Math.sqrt(2);
			this.velocity.x *= normalizer;
			this.velocity.y *= normalizer;
		}

		// Update position based on velocity and delta time
		this.position.x += this.velocity.x * this.speed * (deltaTime / 1000);
		this.position.y += this.velocity.y * this.speed * (deltaTime / 1000);

		// Update sprite position
		super.update(deltaTime);
	}

	/**
	 * Clean up event listeners when movement is no longer needed
	 */
	dispose(): void {
		window.removeEventListener('keydown', (e) => this.handleKeyDown(e));
		window.removeEventListener('keyup', (e) => this.handleKeyUp(e));
	}
}
