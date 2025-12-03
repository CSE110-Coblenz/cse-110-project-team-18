/**
 * PlayerModel - The model for the player
 * @param x - The x position of the player
 * @param y - The y position of the player
 */
export interface PlayerModel {
	x: number;
	y: number;
}

/**
 * AsteroidFieldGameModel - The model for the asteroid field game screen
 * Contains all game state including score, target number, and action tracking
 */
export class AsteroidFieldGameModel {
	player?: PlayerModel;
	score: number = 0;
	targetNumber: number = 1;
	correctActions: number = 0;
	incorrectActions: number = 0;

	constructor(x?: number, y?: number) {
		if (x !== undefined && y !== undefined) {
			this.player = { x, y };
		}
	}

	/**
	 * Reset all game state for a new game
	 * @param targetNumber - Optional new target number (if not provided, resets to default 1)
	 */
	reset(targetNumber?: number): void {
		this.score = 0;
		this.correctActions = 0;
		this.incorrectActions = 0;
		this.targetNumber = targetNumber ?? 1;
	}

	/**
	 * Calculate accuracy based on correct and incorrect actions
	 * @returns Accuracy as a value between 0 and 1 inclusive
	 */
	getAccuracy(): number {
		const totalActions = this.correctActions + this.incorrectActions;
		return totalActions > 0 ? this.correctActions / totalActions : 0;
	}

	/**
	 * Increment correct actions counter
	 */
	incrementCorrect(): void {
		this.correctActions++;
	}

	/**
	 * Increment incorrect actions counter
	 */
	incrementIncorrect(): void {
		this.incorrectActions++;
	}
}
