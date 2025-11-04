// Type declarations for 'konva' are not included in this repo. Suppress TS for this import.
// @ts-ignore
import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import ThemeManager from '../../core/ThemeManager'

/**
 * MenuScreenView - Renders the menu screen
 */
export class MenuScreenView implements View {
	private group: Konva.Group;
	private title!: Konva.Text
	private startButton!: Konva.Rect
	private startText!: Konva.Text
	private unsub?: () => void

	/**
	 * Constructor for the MenuScreenView
	 * @param onStartClick - The function to call when the start button is clicked
	 */
	constructor(onStartClick: () => void) {
		this.group = new Konva.Group({
			visible: true,
			id: 'menuScreen', // Add ID for debugging
		});

		// Title text and controls; values come from theme tokens via ThemeManager
		const theme = ThemeManager.getTheme()

		const remToPx = (val: string | number, base = 16) => {
			if (typeof val === 'number') return val
			if (val.endsWith('rem')) return parseFloat(val) * base
			if (val.endsWith('px')) return parseFloat(val)
			const n = Number(val)
			return Number.isFinite(n) ? n : base
		}

		this.title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: remToPx(theme.spacing['2xl']) * 3, // roughly 3 * spacing
			text: 'MATH EXPLORERS: GALACTIC QUEST',
			fontSize: remToPx(theme.typography.fontSize['2xl']),
			fontFamily: theme.typography.fontFamily,
			fill: theme.colors.text,
			align: 'center',
		})
		this.title.offsetX(this.title.width() / 2)
		this.group.add(this.title)

		const startButtonGroup = new Konva.Group()
		this.startButton = new Konva.Rect({
			x: STAGE_WIDTH / 2 - remToPx(theme.spacing.lg) * 6.25,
			y: remToPx(theme.spacing['2xl']) * 6,
			width: remToPx(theme.spacing.xl) * 10,
			height: remToPx(theme.spacing.lg) * 7,
			fill: theme.colors.success,
			cornerRadius: 10,
			stroke: theme.colors.success,
			strokeWidth: 3,
		})

		this.startText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: this.startButton.y() + remToPx(theme.spacing.sm) * 3,
			text: 'START GAME',
			fontSize: remToPx(theme.typography.fontSize.lg),
			fontFamily: theme.typography.fontFamily,
			fill: theme.colors.primaryForeground,
			align: 'center',
		})
		this.startText.offsetX(this.startText.width() / 2)
		startButtonGroup.add(this.startButton)
		startButtonGroup.add(this.startText)
		startButtonGroup.on('click', onStartClick)
		this.group.add(startButtonGroup)

		// subscribe to theme changes and re-apply styles
		this.unsub = ThemeManager.subscribe(() => {
			this.applyThemeStyles()
		})

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

	/**
	 * Destroy the view and unsubscribe from theme updates.
	 */
	destroy(): void {
		if (this.unsub) {
			this.unsub()
			this.unsub = undefined
		}
		// leave group lifecycle to caller, but remove children to avoid leaks
		try {
			this.group.destroyChildren()
		} catch {}
	}

	private applyThemeStyles(): void {
		const theme = ThemeManager.getTheme()
		const remToPx = (val: string | number, base = 16) => {
			if (typeof val === 'number') return val
			if (String(val).endsWith('rem')) return parseFloat(String(val)) * base
			if (String(val).endsWith('px')) return parseFloat(String(val))
			const n = Number(val)
			return Number.isFinite(n) ? n : base
		}

		if (this.title) {
			this.title.fontFamily(theme.typography.fontFamily)
			this.title.fontSize(remToPx(theme.typography.fontSize['2xl']))
			this.title.fill(theme.colors.text)
			this.title.offsetX(this.title.width() / 2)
		}

		if (this.startButton) {
			this.startButton.fill(theme.colors.success)
			this.startButton.stroke(theme.colors.success)
		}

		if (this.startText) {
			this.startText.fontFamily(theme.typography.fontFamily)
			this.startText.fontSize(remToPx(theme.typography.fontSize.lg))
			this.startText.fill(theme.colors.primaryForeground)
			this.startText.offsetX(this.startText.width() / 2)
		}
	}
}
