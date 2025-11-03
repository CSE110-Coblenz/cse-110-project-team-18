import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import ThemeManager from '../../core/ThemeManager';

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
	private group: Konva.Group;
	private unsubscribeTheme?: () => void;

	/**
	 * Constructor for the MenuScreenView
	 * @param onStartClick - The function to call when the start button is clicked
	 */
	constructor(onStartClick: () => void) {
		this.group = new Konva.Group({
			visible: true,
			id: 'menuScreen', // Add ID for debugging
		});

		// Title text
		const theme = ThemeManager.getTheme();
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 150,
			text: 'MATH EXPLORERS: GALACTIC QUEST',
			fontSize: theme.typography.sizeLarge,
			fontFamily: theme.typography.fontFamily,
			fill: theme.colors.textPrimary,
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
			fill: theme.colors.primary,
			cornerRadius: 10,
			stroke: theme.colors.primaryDark,
			strokeWidth: 3,
		});
		const startText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 315,
			text: 'START GAME',
			fontSize: theme.typography.sizeBase,
			fontFamily: theme.typography.fontFamily,
			fill: theme.colors.textPrimary,
			align: 'center',
		});
		startText.offsetX(startText.width() / 2);
		startButtonGroup.add(startButton);
		startButtonGroup.add(startText);
		startButtonGroup.on('click', onStartClick);
		this.group.add(startButtonGroup);

		// Subscribe to theme updates so Konva nodes update when theme changes
		this.unsubscribeTheme = ThemeManager.subscribe(() => {
			const t = ThemeManager.getTheme();
			// Update title
			title.fontSize(t.typography.sizeLarge);
			title.fontFamily(t.typography.fontFamily);
			title.fill(t.colors.textPrimary);
			// Update button
			startButton.fill(t.colors.primary);
			startButton.stroke(t.colors.primaryDark);
			// Update start text
			startText.fontSize(t.typography.sizeBase);
			startText.fontFamily(t.typography.fontFamily);
			startText.fill(t.colors.textPrimary);
			this.group.getLayer()?.draw();
		});

		// Menu view intentionally stays passive about movement/assets.
		// Asset loading and movement are managed by the controller/manager.
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

	// Optional cleanup if a screen is destroyed
	destroy(): void {
		if (this.unsubscribeTheme) this.unsubscribeTheme();
	}
}
