export interface PlayerModel {
	x: number;
	y: number;
}

export class MenuScreenModel {
	player: PlayerModel;

	constructor(x = 0, y = 0) {
		this.player = { x, y };
	}
}
