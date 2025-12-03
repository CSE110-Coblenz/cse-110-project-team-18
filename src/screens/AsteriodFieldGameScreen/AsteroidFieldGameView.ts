import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { preloadImage } from '../../core/utils/AssetLoader';
import { createButton } from '../../ui';

/**
 * AsteroidFieldGameView - Renders the asteroid field game screen
 */
export class AsteroidFieldGameView implements View {
	private group: Konva.Group;
	private returnButton?: Konva.Group;
	private targetLabel: Konva.Text;
	private scoreLabel: Konva.Text;
	private edgeFlashRect?: Konva.Rect;
	private flashUntil?: number;
	private elapsedTime = 0;
	private maxScore: number = 30; // Default, will be set via setMaxScore

	/**
	 * Constructor for the AsteroidFieldGameView
	 */
	constructor() {
		this.group = new Konva.Group({
			visible: false,
			id: 'asteroidFieldGameScreen',
		});

		// Background image
		const background = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			listening: false,
			image: new Image(),
		});
		void preloadImage('/assets/ui/AsteroidBG.png').then((img) => {
			background.image(img);
			this.group.getLayer()?.batchDraw();
		});
		this.group.add(background);

		// Target label
		this.targetLabel = new Konva.Text({
			text: 'Target: --',
			x: 30,
			y: 30,
			fontSize: 45,
			fontStyle: 'bold',
			fill: '#FFFFFF',
			stroke: '#000000',
			strokeWidth: 1,
			align: 'left',
		});
		this.group.add(this.targetLabel);

		// Score label
		this.scoreLabel = new Konva.Text({
			text: 'Score: 0',
			x: 35,
			y: 85,
			fontSize: 38,
			fontStyle: 'bold',
			fill: '#FFFFFF',
			stroke: '#000000',
			strokeWidth: 1,
			align: 'left',
		});
		this.group.add(this.scoreLabel);

		// Create screen edge flash rectangle (initially invisible)
		this.edgeFlashRect = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: 'transparent',
			strokeWidth: 20,
			stroke: 'transparent',
			visible: false,
			listening: false,
		});
		this.group.add(this.edgeFlashRect);
	}

	/**
	 * Ensure buttons are always on top (call this after sprite loads)
	 */
	ensureButtonsOnTop(): void {
		this.targetLabel.moveToTop();
		this.scoreLabel.moveToTop();
		this.edgeFlashRect?.moveToTop();
		this.returnButton?.moveToTop();
	}

	/**
	 * Show the return to level selector button
	 * @param onClick - Callback when button is clicked
	 */
	showReturnButton(onClick: () => void): void {
		if (this.returnButton) {
			this.returnButton.visible(true);
			return;
		}

		this.returnButton = createButton({
			x: STAGE_WIDTH / 2 - 150,
			y: STAGE_HEIGHT / 2,
			width: 400,
			height: 60,
			text: 'RETURN TO LEVEL SELECTOR',
			colorKey: 'accent_blue',
			hoverColorKey: 'accent_blue_hover',
			onClick,
		});

		this.group.add(this.returnButton);
		this.returnButton.visible(true);
	}

	/**
	 * Hide the return button
	 */
	hideReturnButton(): void {
		this.returnButton?.visible(false);
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

	/**
	 * Set the target number for display purposes
	 * @param target - The target number to display
	 */
	setTargetNumber(target: number): void {
		this.targetLabel.text(`Target: ${target}`);
	}

	/**
	 * Set the maximum score for display purposes
	 * @param maxScore - The maximum score to display
	 */
	setMaxScore(maxScore: number): void {
		this.maxScore = maxScore;
	}

	/**
	 * Set the score for display purposes
	 * @param score - The score to display
	 */
	setScore(score: number): void {
		this.scoreLabel.text(`Score: ${score}/${this.maxScore}`);
	}

	/**
	 * Flash the screen edge
	 * @param isPositive - Whether the flash is positive or negative
	 * @param durationMs - The duration of the flash in milliseconds
	 */
	flashScreenEdge(isPositive: boolean, durationMs: number = 300): void {
		if (!this.edgeFlashRect) return;

		const color = isPositive ? '#2ecc71' : '#e74c3c'; // Green for positive, red for negative
		this.edgeFlashRect.stroke(color);
		this.edgeFlashRect.visible(true);
		this.flashUntil = this.elapsedTime + durationMs;
	}

	/**
	 * Update the asteroid field game view
	 * @param deltaTimeMs - The time since the last frame in milliseconds
	 */
	update(deltaTimeMs: number): void {
		this.elapsedTime += deltaTimeMs;

		// Handle screen edge flash
		if (this.edgeFlashRect && this.flashUntil !== undefined) {
			if (this.elapsedTime >= this.flashUntil) {
				this.edgeFlashRect.visible(false);
				this.flashUntil = undefined;
			}
		}
	}
}
