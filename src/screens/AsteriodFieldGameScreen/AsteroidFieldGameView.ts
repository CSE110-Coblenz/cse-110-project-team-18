import Konva from 'konva';
import type { View } from '../../types.ts';
import { createButton } from '../../ui';
import { STAGE_WIDTH } from '../../configs/GameConfig';

/**
 * AsteroidFieldGameView - Renders the asteroid field game screen
 */
export class AsteroidFieldGameView implements View {
	private group: Konva.Group;
	private buttonGroup?: Konva.Group;
	private targetLabel: Konva.Text;

	/**
	 * Constructor for the AsteroidFieldGameView
	 */
	constructor(onMenuClick: () => void) {
		this.group = new Konva.Group({
			visible: false,
			id: 'asteroidFieldGameScreen',
		});

		// Return to menu button
		const returnToMenuBtn = createButton({
			x: 50,
			y: 50,
			width: 275,
			height: 60,
			text: 'RETURN TO MENU',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onMenuClick,
		});

		this.buttonGroup = returnToMenuBtn;
		this.group.add(returnToMenuBtn);
		returnToMenuBtn.moveToTop();

		this.targetLabel = new Konva.Text({
			text: 'Target: --',
			x: STAGE_WIDTH - 200,
			y: 40,
			fontSize: 32,
			fontStyle: 'bold',
			fill: '#FFFFFF',
			stroke: '#000000',
			strokeWidth: 2,
		});
		this.targetLabel.x(STAGE_WIDTH - this.targetLabel.width() - 40);
		this.group.add(this.targetLabel);
	}

	/**
	 * Ensure buttons are always on top (call this after sprite loads)
	 */
	ensureButtonsOnTop(): void {
		if (this.buttonGroup) {
			this.buttonGroup.moveToTop();
		}
		this.targetLabel.moveToTop();
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

	setTargetNumber(target: number): void {
		this.targetLabel.text(`Target: ${target}`);
		this.targetLabel.x(STAGE_WIDTH - this.targetLabel.width() - 40);
		this.targetLabel.moveToTop();
	}
}
