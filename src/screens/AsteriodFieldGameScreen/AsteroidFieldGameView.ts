import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { preloadImage } from '../../core/utils/AssetLoader';

/**
 * AsteroidFieldGameView - Renders the asteroid field game screen
 */
export class AsteroidFieldGameView implements View {
	private group: Konva.Group;
	private targetLabel: Konva.Text;
	private scoreLabel: Konva.Text;
	private edgeFlashRect?: Konva.Rect;
	private flashUntil?: number;
	private elapsedTime = 0;

	/**
	 * Constructor for the AsteroidFieldGameView
	 */
	constructor() {
		this.group = new Konva.Group({
			visible: false,
			id: 'asteroidFieldGameScreen',
		});

		// BACKGROUND IMAGE
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
		if (this.edgeFlashRect) {
			this.edgeFlashRect.moveToTop();
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

	setTargetNumber(target: number): void {
		this.targetLabel.text(`Target: ${target}`);
		this.targetLabel.moveToTop();
	}

	setScore(score: number): void {
		this.scoreLabel.text(`Score: ${score}`);
		this.scoreLabel.moveToTop();
	}

	flashScreenEdge(isPositive: boolean, durationMs: number = 300): void {
		if (!this.edgeFlashRect) return;

		const color = isPositive ? '#2ecc71' : '#e74c3c'; // Green for positive, red for negative
		this.edgeFlashRect.stroke(color);
		this.edgeFlashRect.visible(true);
		this.flashUntil = this.elapsedTime + durationMs;
		this.edgeFlashRect.moveToTop();
	}

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
