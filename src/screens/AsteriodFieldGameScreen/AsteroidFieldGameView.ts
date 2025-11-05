import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';

/**
 * AsteroidFieldGameView - Renders the asteroid field game screen
 */
export class AsteroidFieldGameView implements View {
	private group: Konva.Group;
	private buttonGroup?: Konva.Group;

	/**
	 * Constructor for the AsteroidFieldGameView
	 */
	constructor(onMenuClick: () => void) {
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

		// Return to menu button
		const menuButtonGroup = new Konva.Group();
		const menuButton = new Konva.Rect({
			x: STAGE_WIDTH / 2 - 200,
			y: 375,
			width: 400,
			height: 60,
			fill: 'green',
			cornerRadius: 10,
			stroke: 'darkgreen',
			strokeWidth: 3,
			listening: true, // Ensure the rect itself listens to clicks
		});

		const menuText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 390,
			text: 'Return to Menu',
			fontSize: 24,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
			listening: false,
		});
		menuText.offsetX(menuText.width() / 2);
		menuButtonGroup.add(menuButton);
		menuButtonGroup.add(menuText);
		menuButtonGroup.on('click', onMenuClick);
		this.buttonGroup = menuButtonGroup;
		this.group.add(menuButtonGroup);
		menuButtonGroup.moveToTop();
	}

	/**
	 * Ensure buttons are always on top (call this after sprite loads)
	 */
	ensureButtonsOnTop(): void {
		if (this.buttonGroup) {
			this.buttonGroup.moveToTop();
		}
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
