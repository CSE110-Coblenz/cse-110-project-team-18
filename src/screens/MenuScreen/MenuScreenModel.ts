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
 * MenuScreenModel - The model for the menu screen
 * @param player - The player model (optional)
 */
export class MenuScreenModel {
	player?: PlayerModel;

	constructor(x?: number, y?: number) {
		if (x !== undefined && y !== undefined) {
			this.player = { x, y };
		}
	}
}
