import { InputManager } from '../input/InputManager';

/**
 * PauseManager - Manages game pause state and ESC key handling
 * Handles pausing/unpausing the game and coordinating with pause menu UI
 */
export class PauseManager {
	private isPaused: boolean = false;
	private onPause?: () => void;
	private onResume?: () => void;
	private canPause: () => boolean;
	private inputManager: InputManager;

	constructor(
		canPause: () => boolean,
		onPause?: () => void,
		onResume?: () => void
	) {
		this.canPause = canPause;
		this.onPause = onPause;
		this.onResume = onResume;
		this.inputManager = InputManager.getInstance();
	}

	/**
	 * Update pause manager (checks for ESC key press)
	 * Should be called in the game loop
	 */
	update(): void {
		if (!this.canPause()) {
			return;
		}

		// Check for ESC key press to toggle pause
		if (this.inputManager.consumePress('escape', 200)) {
			this.togglePause();
		}
	}

	/**
	 * Toggle pause state
	 */
	togglePause(): void {
		if (!this.canPause()) {
			return;
		}

		this.isPaused = !this.isPaused;

		if (this.isPaused) {
			console.log('Pausing game');
			if (this.onPause) {
				this.onPause();
			}
		} else {
			console.log('Unpausing game');
			if (this.onResume) {
				this.onResume();
			}
		}
	}

	/**
	 * Set pause state explicitly
	 */
	setPaused(paused: boolean): void {
		if (this.isPaused === paused) {
			return;
		}
		this.isPaused = paused;

		if (this.isPaused) {
			if (this.onPause) {
				this.onPause();
			}
		} else {
			if (this.onResume) {
				this.onResume();
			}
		}
	}

	/**
	 * Set pause state without triggering callbacks
	 * Useful when pausing for reasons other than the pause menu (e.g., help overlay)
	 */
	setPausedSilently(paused: boolean): void {
		this.isPaused = paused;
	}

	/**
	 * Check if game is currently paused
	 */
	isGamePaused(): boolean {
		return this.isPaused;
	}

	/**
	 * Reset pause state (e.g., when switching screens)
	 */
	reset(): void {
		this.isPaused = false;
		if (this.onResume) {
			this.onResume();
		}
	}
}
