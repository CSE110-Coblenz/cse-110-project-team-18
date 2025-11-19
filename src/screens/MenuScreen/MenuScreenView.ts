import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { createButton } from '../../ui';

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
	private group: Konva.Group;
	private buttonGroup?: Konva.Group;

	/**
	 * MenuScreenView constructor
	 * @param onAsteroidClick - callback for asteroid field game
	 * @param onPrimeClick - callback for prime number game
	 * @param onEarthClick - callback for earth time crunch game
	 * @param onMercuryClick - callback for mercury game
	 */
	constructor(onAsteroidClick: () => void, onPrimeClick: () => void, onEarthClick: () => void, onMercuryClick: () => void) {
		this.group = new Konva.Group({
			visible: true,
			id: 'menuScreen',
		});

		//-------------------------------------------------------
		// Title
		//-------------------------------------------------------
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 150,
			text: 'MATH EXPLORERS: GALACTIC QUEST',
			fontSize: 48,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});
		title.offsetX(title.width() / 2);
		this.group.add(title);

		//-------------------------------------------------------
		// Button container
		//-------------------------------------------------------
		const buttonGroup = new Konva.Group({ listening: true });

		//-------------------------------------------------------
		// Asteroid Field Game Button
		//-------------------------------------------------------
		const asteroidFieldBtn = createButton({
			x: STAGE_WIDTH / 2 - 200,
			y: 375,
			width: 400,
			height: 60,
			text: 'START ASTEROID FIELD GAME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onAsteroidClick,
		});

		//-------------------------------------------------------
		// Prime Number Game Button
		//-------------------------------------------------------
		const primeGameButton = createButton({
			x: STAGE_WIDTH / 2 - 200,
			y: 450,
			width: 400,
			height: 60,
			text: 'START PRIME NUMBER GAME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onPrimeClick,
		});

		//-------------------------------------------------------
		// Earth Time Crunch Button
		//-------------------------------------------------------
		const earthButton = createButton({
			x: STAGE_WIDTH / 2 - 200,
			y: 525,
			width: 400,
			height: 60,
			text: 'START EARTH TIME CRUNCH',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onEarthClick,
		});

		//-------------------------------------------------------
		// Mercury Game Button
		//-------------------------------------------------------
		const mercuryButton = createButton({
			x: STAGE_WIDTH / 2 - 200,
			y: 600,
			width: 400,
			height: 60,
			text: 'START MERCURY GAME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onMercuryClick,
		});

		//-------------------------------------------------------
		// Add buttons to group
		//-------------------------------------------------------
		buttonGroup.add(asteroidFieldBtn);
		buttonGroup.add(primeGameButton);
		buttonGroup.add(earthButton);
		buttonGroup.add(mercuryButton);

		this.buttonGroup = buttonGroup;
		this.group.add(buttonGroup);
	}

	//-------------------------------------------------------
	// View Methods
	//-------------------------------------------------------
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	ensureButtonsOnTop(): void {
		if (this.buttonGroup) {
			this.buttonGroup.moveToTop();
		}
	}
}
