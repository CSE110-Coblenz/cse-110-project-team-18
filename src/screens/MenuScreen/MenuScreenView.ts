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
	 * @param onAsteriodFieldClick - The function to call when the start button is clicked
	 * @param onPrimeGameClick - The function to call when the prime number game button is clicked
	 */
	constructor(onAsteriodFieldClick: () => void, onPrimeGameClick: () => void) {
		this.group = new Konva.Group({
			visible: true,
			id: 'menuScreen',
		});

		// Title text (unchanged)
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

		// Start button for asteroid field game
		const asteroidFieldBtn = createButton({
			x: STAGE_WIDTH / 2 - 200,
			y: 375,
			width: 400,
			height: 60,
			text: 'START ASTEROID FIELD GAME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onAsteriodFieldClick,
		});

		const primeGameButton = createButton({
			x: STAGE_WIDTH / 2 - 200,
			y: 450,
			width: 400,
			height: 60,
			text: 'START PRIME NUMBER GAME',
			colorKey: 'cosmic_purple',
			hoverColorKey: 'info_hover',
			onClick: onPrimeGameClick,
		});

		this.buttonGroup = asteroidFieldBtn;
		this.group.add(asteroidFieldBtn);
		this.group.add(primeGameButton);
		asteroidFieldBtn.moveToTop();
	}

	ensureButtonsOnTop(): void {
		if (this.buttonGroup) {
			this.buttonGroup.moveToTop();
		}
	}

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
}
