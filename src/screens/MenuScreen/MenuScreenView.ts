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
	 * Updated constructor with THREE actions merged from both branches
	 * @param onAsteroidClick
	 * @param onPrimeClick
	 * @param onEarthClick
	 */
	constructor(
		onAsteroidClick: () => void,
		onPrimeClick: () => void,
		onEarthClick: () => void
	) {
		this.group = new Konva.Group({
			visible: true,
			id: 'menuScreen',
		});

		// -------------------------------------------------------
		// Title Text
		// -------------------------------------------------------
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

		// -------------------------------------------------------
		// BUTTON CONTAINER
		// -------------------------------------------------------
		const buttonGroup = new Konva.Group({ listening: true });

		// -------------------------------------------------------
		// ASTEROID FIELD GAME BUTTON  (from main)
		// -------------------------------------------------------
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

		// -------------------------------------------------------
		// PRIME NUMBER GAME BUTTON  (from main)
		// -------------------------------------------------------
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

		buttonGroup.add(asteroidFieldBtn);
		buttonGroup.add(primeGameButton);

		this.buttonGroup = buttonGroup;
		this.group.add(buttonGroup);

		// -------------------------------------------------------
		// EARTH GAME BUTTON (your feature)
		// -------------------------------------------------------
		const earthButtonGroup = new Konva.Group({
			x: STAGE_WIDTH / 2 - 50,
			y: 550,
		});

		const earthImageObj = new Image();
		earthImageObj.src = '/assets/planets/earth.png';

		earthImageObj.onload = () => {
			const earthImage = new Konva.Image({
				image: earthImageObj,
				width: 100,
				height: 100,
			});

			// hover animation
			earthImage.on('mouseenter', () => {
				document.body.style.cursor = 'pointer';
				earthImage.to({ scaleX: 1.1, scaleY: 1.1, duration: 0.15 });
			});
			earthImage.on('mouseleave', () => {
				document.body.style.cursor = 'default';
				earthImage.to({ scaleX: 1, scaleY: 1, duration: 0.15 });
			});

			earthImage.on('click', onEarthClick);

			earthButtonGroup.add(earthImage);
			this.group.add(earthButtonGroup);
		};
	}

	//------------------------------------------------------
	// VIEW INTERFACE
	//------------------------------------------------------
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
