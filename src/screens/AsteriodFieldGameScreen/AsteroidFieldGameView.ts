import Konva from 'konva';
import type { View } from '../../types.ts';

/**
 * AsteroidFieldGameView - Renders the asteroid field game screen
 */
export class AsteroidFieldGameView implements View {
	private group: Konva.Group;

	/**
	 * Constructor for the AsteroidFieldGameView
	 */
	constructor() {
		this.group = new Konva.Group({
			visible: false,
			id: 'asteroidFieldGameScreen',
		});

		// Placeholder text for the asteroid field game screen
		const title = new Konva.Text({
			x: 400,
			y: 300,
			text: 'ASTEROID FIELD GAME',
			fontSize: 48,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});
		title.offsetX(title.width() / 2);
		this.group.add(title);
	}

	/**
	 * Show the screen
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	/**
	 * Hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	/**
	 * Get the group of the asteroid field game screen view
	 * @returns The group of the asteroid field game screen view
	 */
	getGroup(): Konva.Group {
		return this.group;
	}
}
