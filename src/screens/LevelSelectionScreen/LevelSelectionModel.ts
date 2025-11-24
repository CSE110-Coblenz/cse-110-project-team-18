// src/screens/level-selection/LevelSelectionModel.ts

export interface PlayerModel {
	x: number;
	y: number;
}

/**
 * LevelSelectionModel - Stores transient state for this screen
 */
export class LevelSelectionModel {
	player?: PlayerModel;

	constructor(x?: number, y?: number) {
		if (x !== undefined && y !== undefined) {
			this.player = { x, y };
		}
	}
}
