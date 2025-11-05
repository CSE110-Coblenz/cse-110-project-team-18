import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
	private group: Konva.Group;

	/**
	 * Constructor for the MenuScreenView
	 * @param onStartClick - The function to call when the start button is clicked
	 */
	constructor(onStartClick: () => void, onEarthClick: () => void) {
		this.group = new Konva.Group({
			visible: true,
			id: 'menuScreen', // Add ID for debugging
		});

		// Title text
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 150,
			text: 'MATH EXPLORERS: GALACTIC QUEST',
			fontSize: 48,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});
		// Center the text using offsetX
		title.offsetX(title.width() / 2);
		this.group.add(title);

		const startButtonGroup = new Konva.Group();
		const startButton = new Konva.Rect({
			x: STAGE_WIDTH / 2 - 100,
			y: 300,
			width: 200,
			height: 60,
			fill: 'green',
			cornerRadius: 10,
			stroke: 'darkgreen',
			strokeWidth: 3,
		});
		const startText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 315,
			text: 'START GAME',
			fontSize: 24,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});
		startText.offsetX(startText.width() / 2);
		startButtonGroup.add(startButton);
		startButtonGroup.add(startText);
		startButtonGroup.on('click', onStartClick);
		this.group.add(startButtonGroup);

		// Menu view intentionally stays passive about movement/assets.
		// Asset loading and movement are managed by the controller/manager.

		const earthButtonGroup = new Konva.Group();
		const earthButton = new Konva.Rect({
			x: STAGE_WIDTH / 2 - 100,
			y: 400,
			width: 200,
			height: 60,
			fill: 'blue',
			cornerRadius: 10,
			stroke: 'darkblue',
			strokeWidth: 3,
		});
		const earthText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 415,
			text: 'EARTH SCREEN',
			fontSize: 24,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});
		earthText.offsetX(earthText.width() / 2);
		earthButtonGroup.add(earthButton);
		earthButtonGroup.add(earthText);
		earthButtonGroup.on('click', onEarthClick); // Handle the click event
		this.group.add(earthButtonGroup); // Add Earth button to the main group
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
	 * Get the group of the menu screen view
	 * @returns The group of the menu screen view
	 */
	getGroup(): Konva.Group {
		return this.group;
	}
}
