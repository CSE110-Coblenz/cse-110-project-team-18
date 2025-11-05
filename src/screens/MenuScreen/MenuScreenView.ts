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

		// earth button here
		// Earth button (image)
		const earthButtonGroup = new Konva.Group({
			x: STAGE_WIDTH / 2 - 50, // centers horizontally
			y: 400, // same vertical placement as before
		});

		const earthImageObj = new Image();
		earthImageObj.src = '/assets/planets/earth.png'; // path inside public folder

		earthImageObj.onload = () => {
			const earthImage = new Konva.Image({
				image: earthImageObj,
				width: 100,
				height: 100,
			});

			// Hover animation
			earthImage.on('mouseenter', () => {
				document.body.style.cursor = 'pointer';
				earthImage.to({ scaleX: 1.1, scaleY: 1.1, duration: 0.15 });
			});
			earthImage.on('mouseleave', () => {
				document.body.style.cursor = 'default';
				earthImage.to({ scaleX: 1, scaleY: 1, duration: 0.15 });
			});

			// Click handler
			earthImage.on('click', onEarthClick);

			earthButtonGroup.add(earthImage);
			this.group.add(earthButtonGroup);
		};
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
