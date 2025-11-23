import Konva from 'konva';
import type { Screen } from '../../types.ts';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { preloadImage } from '../utils/AssetLoader';
import { createButton } from '../../ui';

/**
 * HelpManager - Manages help button and overlay functionality
 * Handles displaying contextual help slides for different game screens
 */
export class HelpManager {
	private layer: Konva.Layer;
	private helpButtonGroup?: Konva.Group;
	private currentHelpContext: string | null = null;
	private helpOverlayGroup?: Konva.Group;
	private helpOverlayImage?: Konva.Image;
	private helpPrevButton?: Konva.Group;
	private helpNextButton?: Konva.Group;
	private helpReturnButton?: Konva.Group;
	private helpSlides: string[] = [];
	private helpSlideIndex: number = 0;
	private onHelpShown?: () => void;
	private onHelpHidden?: () => void;
	private getActiveController?: () => any;

	constructor(layer: Konva.Layer) {
		this.layer = layer;
		this.initializeHelpButton();
		this.initializeHelpOverlay();
	}

	/**
	 * Set callback for when help is shown
	 */
	setOnHelpShown(callback: () => void): void {
		this.onHelpShown = callback;
	}

	/**
	 * Set callback for when help is hidden
	 */
	setOnHelpHidden(callback: () => void): void {
		this.onHelpHidden = callback;
	}

	/**
	 * Set function to get active controller (for input visibility)
	 */
	setGetActiveController(getter: () => any): void {
		this.getActiveController = getter;
	}

	/**
	 * Update help button visibility based on current screen
	 */
	updateForScreen(screenType: Screen['type']): void {
		const context = this.getHelpContext(screenType);
		this.currentHelpContext = context;
		if (!context) {
			this.hideHelpOverlay();
		}
		const visible = Boolean(context);
		if (this.helpButtonGroup) {
			this.helpButtonGroup.visible(visible);
			this.helpButtonGroup.listening(visible);
			if (visible) {
				// Move help button to top (but below pause menu which is moved to top separately)
				this.helpButtonGroup.moveToTop();
			}
		}
		this.layer.batchDraw();
	}

	/**
	 * Hide help button (e.g., when pause menu is shown)
	 */
	hideHelpButton(): void {
		if (this.helpButtonGroup) {
			this.helpButtonGroup.visible(false);
			this.helpButtonGroup.listening(false);
		}
	}

	/**
	 * Show help button (e.g., when pause menu is hidden)
	 */
	showHelpButton(): void {
		if (this.helpButtonGroup && this.currentHelpContext) {
			this.helpButtonGroup.visible(true);
			this.helpButtonGroup.listening(true);
			// Move help button to top (but below pause menu which is moved to top separately)
			this.helpButtonGroup.moveToTop();
			this.layer.batchDraw();
		}
	}

	/**
	 * Hide help overlay
	 */
	hideHelpOverlay(): void {
		if (!this.helpOverlayGroup) return;
		this.helpOverlayGroup.visible(false);
		this.helpOverlayGroup.listening(false);

		if (this.helpButtonGroup && this.currentHelpContext) {
			this.helpButtonGroup.listening(true);
		}

		// Restore input boxes when hiding help (e.g., Mercury game)
		if (this.getActiveController) {
			const controller = this.getActiveController();
			if (controller && 'setInputVisible' in controller) {
				controller.setInputVisible(true);
			}
		}

		this.helpSlides = [];
		this.helpSlideIndex = 0;
		if (this.helpPrevButton) this.helpPrevButton.visible(false);
		if (this.helpNextButton) this.helpNextButton.visible(false);

		if (this.onHelpHidden) {
			this.onHelpHidden();
		}

		this.layer.batchDraw();
	}

	/**
	 * Check if help overlay is currently visible
	 */
	isHelpOverlayVisible(): boolean {
		return this.helpOverlayGroup?.visible() ?? false;
	}

	private initializeHelpButton(): void {
		this.helpButtonGroup = new Konva.Group({
			x: STAGE_WIDTH - 60,
			y: 20,
			visible: false,
			listening: true,
		});

		const helpButton = new Konva.Image({
			width: 45,
			height: 45,
			image: new Image(),
			listening: true,
			cursor: 'pointer',
		});

		this.helpButtonGroup.add(helpButton);

		this.helpButtonGroup.on('click tap', () => {
			if (this.currentHelpContext) {
				const slides = this.getHelpSlides(this.currentHelpContext);
				if (slides.length === 0) {
					console.log(`No help slides configured for ${this.currentHelpContext}`);
					return;
				}
				this.showHelpOverlay(slides);
			}
		});

		// Don't add to layer here - will be added later after screens
		// This ensures it appears above screens but below pause menu

		void preloadImage('/assets/ui/HelpButton.png').then((img) => {
			helpButton.image(img);
			if (this.helpButtonGroup && this.helpButtonGroup.getLayer()) {
				this.helpButtonGroup.getLayer()?.batchDraw();
			}
		});
	}

	/**
	 * Add help button to layer (should be called after screens are added)
	 */
	addToLayer(): void {
		if (this.helpButtonGroup && !this.helpButtonGroup.getLayer()) {
			this.layer.add(this.helpButtonGroup);
		}
	}

	private initializeHelpOverlay(): void {
		this.helpOverlayGroup = new Konva.Group({
			visible: false,
			listening: false,
		});

		const backdrop = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: 'rgba(0,0,0,0.85)',
		});
		this.helpOverlayGroup.add(backdrop);

		this.helpOverlayImage = new Konva.Image({
			x: STAGE_WIDTH * 0.1,
			y: STAGE_HEIGHT * 0.1,
			width: STAGE_WIDTH * 0.8,
			height: STAGE_HEIGHT * 0.65,
			listening: false,
			image: new Image(),
		});

		this.helpOverlayGroup.add(this.helpOverlayImage);

		this.helpPrevButton = createButton({
			x: STAGE_WIDTH * 0.15,
			y: STAGE_HEIGHT - 120,
			width: 200,
			height: 60,
			text: 'PREVIOUS',
			colorKey: 'cosmic_purple',
			hoverColorKey: 'accent_blue',
			onClick: () => this.changeHelpSlide(-1),
		});

		this.helpNextButton = createButton({
			x: STAGE_WIDTH - STAGE_WIDTH * 0.15 - 200,
			y: STAGE_HEIGHT - 120,
			width: 200,
			height: 60,
			text: 'NEXT',
			colorKey: 'cosmic_purple',
			hoverColorKey: 'accent_blue',
			onClick: () => this.changeHelpSlide(1),
		});

		this.helpReturnButton = createButton({
			x: STAGE_WIDTH / 2 - 150,
			y: STAGE_HEIGHT - 120,
			width: 300,
			height: 60,
			text: 'RETURN TO GAME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: () => this.hideHelpOverlay(),
		});

		this.helpOverlayGroup.add(this.helpPrevButton);
		this.helpOverlayGroup.add(this.helpNextButton);
		this.helpOverlayGroup.add(this.helpReturnButton);

		this.layer.add(this.helpOverlayGroup);
	}

	private showHelpOverlay(slides: string[]): void {
		if (!this.helpOverlayGroup || !this.helpOverlayImage) return;
		this.helpSlides = slides;
		this.helpSlideIndex = 0;
		this.helpOverlayGroup.visible(true);
		this.helpOverlayGroup.listening(true);
		this.helpOverlayGroup.moveToTop();
		this.loadHelpSlide(this.helpSlideIndex);
		this.updateHelpNavigation();
		if (this.helpButtonGroup) {
			this.helpButtonGroup.listening(false);
		}

		// Hide input boxes when showing help (e.g., Mercury game)
		if (this.getActiveController) {
			const controller = this.getActiveController();
			if (controller && 'setInputVisible' in controller) {
				controller.setInputVisible(false);
			}
		}

		if (this.onHelpShown) {
			this.onHelpShown();
		}

		this.layer.batchDraw();
	}

	private changeHelpSlide(delta: number): void {
		if (this.helpSlides.length === 0) return;
		const newIndex = this.helpSlideIndex + delta;
		if (newIndex < 0 || newIndex >= this.helpSlides.length) return;
		this.helpSlideIndex = newIndex;
		this.loadHelpSlide(this.helpSlideIndex);
		this.updateHelpNavigation();
	}

	private updateHelpNavigation(): void {
		const hasMultiple = this.helpSlides.length > 1;
		if (this.helpPrevButton) {
			this.helpPrevButton.visible(hasMultiple);
			this.helpPrevButton.listening(hasMultiple);
		}
		if (this.helpNextButton) {
			this.helpNextButton.visible(hasMultiple);
			this.helpNextButton.listening(hasMultiple);
		}
	}

	private loadHelpSlide(index: number): void {
		const imageNode = this.helpOverlayImage;
		if (!imageNode) return;
		const slide = this.helpSlides[index];
		void preloadImage(slide)
			.then((img) => {
				const maxWidth = STAGE_WIDTH * 0.8;
				const maxHeight = STAGE_HEIGHT * 0.65;
				const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1);
				const width = img.width * scale;
				const height = img.height * scale;
				imageNode.width(width);
				imageNode.height(height);
				imageNode.x((STAGE_WIDTH - width) / 2);
				imageNode.y((STAGE_HEIGHT - height) / 2 - 40);
				imageNode.image(img);
				this.layer.batchDraw();
			})
			.catch((err) => {
				console.error(`Failed to load help slide: ${slide}`, err);
			});
	}

	private getHelpContext(screenType: Screen['type']): string | null {
		switch (screenType) {
			case 'menu':
				return null;
			case 'asteroid field game':
				return 'Asteroid Field';
			case 'prime number game':
				return 'Prime Number';
			case 'mercury game':
				return 'Mercury';
			case 'earth':
				return 'Earth';
			case 'knowledge':
				return 'Knowledge';
			case 'military time game':
				return 'Military Time';
			case 'game':
				return 'Game';
			case 'result':
				return 'Result';
			default:
				return screenType;
		}
	}

	private getHelpSlides(context: string): string[] {
		switch (context) {
			case 'Asteroid Field':
				return ['/assets/ui/AsteroidFieldHelp1.png', '/assets/ui/AsteroidFieldHelp2.png'];
			default:
				return [];
		}
	}
}
