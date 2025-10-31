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
 * @param player - The player model
 */
export class MenuScreenModel {
	player: PlayerModel;

	constructor(x = 0, y = 0) {
		this.player = { x, y };
	}
}
