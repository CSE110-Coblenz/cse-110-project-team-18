export class InputManager {
	private static instance: InputManager | null = null;
	private keys: Set<string> = new Set();
	private handleKeyDownBound: (e: KeyboardEvent) => void;
	private handleKeyUpBound: (e: KeyboardEvent) => void;
	private initialized = false;

	private constructor() {
		// Bind methods once
		this.handleKeyDownBound = (e: KeyboardEvent) => this.handleKeyDown(e);
		this.handleKeyUpBound = (e: KeyboardEvent) => this.handleKeyUp(e);
	}

	/**
	 * Get the singleton instance
	 */
	static getInstance(): InputManager {
		if (!InputManager.instance) {
			InputManager.instance = new InputManager();
		}
		return InputManager.instance;
	}

	/**
	 * Initialize event listeners (should be called once at game start)
	 */
	initialize(): void {
		if (this.initialized) return;
		window.addEventListener('keydown', this.handleKeyDownBound);
		window.addEventListener('keyup', this.handleKeyUpBound);
		this.initialized = true;
	}

	/**
	 * Clean up event listeners (should be called when game shuts down)
	 */
	dispose(): void {
		if (!this.initialized) return;
		window.removeEventListener('keydown', this.handleKeyDownBound);
		window.removeEventListener('keyup', this.handleKeyUpBound);
		this.initialized = false;
	}

	private handleKeyDown(e: KeyboardEvent): void {
		// Store all keys in lowercase for consistency
		let key = e.key.toLowerCase();

		// Normalize spacebar key (some browsers use 'Space', others use ' ')
		if (key === 'space') {
			key = ' ';
		}

		this.keys.add(key);
	}

	private handleKeyUp(e: KeyboardEvent): void {
		let key = e.key.toLowerCase();

		// Normalize spacebar key (some browsers use 'Space', others use ' ')
		if (key === 'space') {
			key = ' ';
		}

		this.keys.delete(key);
	}

	/**
	 * Check if a key is currently pressed
	 */
	isKeyPressed(key: string): boolean {
		return this.keys.has(key.toLowerCase());
	}

	/**
	 * Check if any of the given keys are pressed
	 */
	isAnyKeyPressed(keys: readonly string[]): boolean {
		return keys.some((key) => this.keys.has(key.toLowerCase()));
	}

	/**
	 * Get all currently pressed keys (read-only copy)
	 */
	getPressedKeys(): Set<string> {
		return new Set(this.keys);
	}

	/**
	 * Clear all key states (useful for reset or pause)
	 */
	clear(): void {
		this.keys.clear();
	}
}
