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
 * @param player - The player model (optional)
 * @param score - The current score
 */
export class AsteroidFieldGameModel {
	player?: PlayerModel;
	score: number = 0;

	constructor(x?: number, y?: number) {
		if (x !== undefined && y !== undefined) {
			this.player = { x, y };
		}
	}
}
