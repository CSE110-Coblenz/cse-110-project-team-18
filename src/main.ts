import Konva from 'konva';
import { MenuScreenController } from './screens/MenuScreen/MenuScreenController.ts';
import { AsteroidFieldGameController } from './screens/AsteriodFieldGameScreen/AsteroidFieldGameController.ts';
import type { ScreenSwitcher, Screen, ScreenController } from './types.ts';
import { STAGE_WIDTH, STAGE_HEIGHT } from './configs/GameConfig';
import { InputManager } from './core/input/InputManager';
import { EarthScreenController } from './screens/EarthScreen/EarthScreenController';
import { PrimeNumberGameController } from './screens/PrimeNumberGameScreen/PrimeNumberGameController.ts';
import { MercuryGameController } from './planets/mercury/MercuryGameController.ts';
import { KnowledgeScreenController } from './screens/KnowledgeScreen/KnowledgeScreenController.ts';
import { MilitaryTimeGameController } from './screens/MilitaryTimeGameScreen/MilTimeGameController.ts';
import { PauseMenuController } from './screens/PauseMenuScreen/PauseMenuController.ts';
import { preloadImage } from './core/utils/AssetLoader';
import { createButton } from './ui';
// Space Math Adventure - Main Entry Point
/**
 * Main Application - Coordinates all screens
 *
 * This class demonstrates screen management using Konva Groups.
 * Each screen (Menu, Game, Results) has its own Konva.Group that can be
 * shown or hidden independently.
 *
 * Key concept: All screens are added to the same layer, but only one is
 * visible at a time. This is managed by the switchToScreen() method.
 */
class App implements ScreenSwitcher {
	private stage: Konva.Stage;
	private layer: Konva.Layer;

	private activeController?: ScreenController | null;

	private menuController: MenuScreenController;
	private primeNumberGameController: PrimeNumberGameController;
	private asteroidFieldGameController: AsteroidFieldGameController;
	private mercuryGameController: MercuryGameController;
	// private gameController: GameScreenController;
	// private resultsController: ResultsScreenController;
	/*
	add Earth screen controller
	*/
	private earthController: EarthScreenController;
	private knowledgeController: KnowledgeScreenController;
	private militaryController: MilitaryTimeGameController;
	private pauseMenuController: PauseMenuController;
	private helpButtonGroup?: Konva.Group;
	private currentHelpContext: string | null = null;
	private currentScreenType: Screen['type'] = 'menu';
	private helpOverlayGroup?: Konva.Group;
	private helpOverlayImage?: Konva.Image;
	private helpPrevButton?: Konva.Group;
	private helpNextButton?: Konva.Group;
	private helpReturnButton?: Konva.Group;
	private helpSlides: string[] = [];
	private helpSlideIndex: number = 0;

	private isPaused: boolean = false;

	constructor(container: string) {
		// Initialize centralized input manager (single event listener system)
		InputManager.getInstance().initialize();

		// Initialize Konva stage (the main canvas)
		this.stage = new Konva.Stage({
			container,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
		});

		// Create a layer (screens will be added to this layer)
		this.layer = new Konva.Layer();
		this.stage.add(this.layer);

		// Initialize all screen controllers
		// Each controller manages a Model, View, and handles user interactions
		this.menuController = new MenuScreenController(this);
		this.primeNumberGameController = new PrimeNumberGameController(this);
		this.asteroidFieldGameController = new AsteroidFieldGameController(this);
		this.mercuryGameController = new MercuryGameController(this);

		/*
		initialize Earth screen controller below:
		*/
		this.earthController = new EarthScreenController(this);
		this.knowledgeController = new KnowledgeScreenController(this);
		this.militaryController = new MilitaryTimeGameController(this);

		// Initialize pause menu controller
		this.pauseMenuController = new PauseMenuController(this, () => {
			this.togglePause();
		});

		// Add all screen groups to the layer
		// All screens exist simultaneously but only one is visible at a time
		this.layer.add(this.menuController.getView().getGroup());
		this.layer.add(this.primeNumberGameController.getView().getGroup());
		this.layer.add(this.asteroidFieldGameController.getView().getGroup());
		this.layer.add(this.mercuryGameController.getView().getGroup());
		// this.layer.add(this.gameController.getView().getGroup());
		// this.layer.add(this.resultsController.getView().getGroup());

		/*
		add Earth screen group to the layer
		*/
		this.layer.add(this.earthController.getView().getGroup());
		// add the knwledge screen group to the layer
		this.layer.add(this.knowledgeController.getView().getGroup());

		this.initializeHelpButton();
		this.initializeHelpOverlay();

		// Add pause menu last so it appears on top
		this.layer.add(this.pauseMenuController.getView().getGroup());

		// Draw the layer (render everything to the canvas)
		this.layer.draw();

		// Start with menu screen visible and set it as the active controller
		this.switchToScreen({ type: 'menu' });

		// Start central game loop that updates only the active controller
		let lastTime = performance.now();
		const inputManager = InputManager.getInstance();
		const loop = (now: number) => {
			const dt = now - lastTime; // ms
			lastTime = now;

			// Check for ESC key press to toggle pause (only when not on menu screen)
			if (this.activeController !== this.menuController) {
				if (inputManager.consumePress('escape', 200)) {
					// If help overlay is visible, close it first
					if (this.helpOverlayGroup && this.helpOverlayGroup.visible()) 
						this.hideHelpOverlay();
					else
						this.togglePause();
				}
			}

			// Only update active controller if not paused
			if (!this.isPaused && this.activeController) {
				this.activeController.update(dt);
			}

			requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);

		console.log('Space Math Adventure initialized');
	}

	/**
	 * Switch to a different screen
	 *
	 * This method implements screen management by:
	 * 1. Hiding all screens (setting their Groups to invisible)
	 * 2. Showing only the requested screen
	 *
	 * This pattern ensures only one screen is visible at a time.
	 */
	switchToScreen(screen: Screen): void {
		// Hide pause menu when switching screens
		this.pauseMenuController.hide();
		this.isPaused = false;

		// Hide all screens first by setting their Groups to invisible
		this.menuController.hide();
		this.primeNumberGameController.hide();
		this.asteroidFieldGameController.hide();
		this.mercuryGameController.hide();
		// this.gameController.hide();
		// this.resultsController.hide();
		this.earthController.hide(); // hide Earth screen
		this.knowledgeController.hide(); // hide Knowledge screen
		this.militaryController.hide();
		this.layer.add(this.militaryController.getView().getGroup());
		// Show the requested screen based on the screen type
		switch (screen.type) {
			case 'menu':
				this.menuController.show();
				this.activeController = this.menuController;
				console.log('Showing menu screen');
				break;

			case 'asteroid field game':
				this.asteroidFieldGameController.show();
				this.activeController = this.asteroidFieldGameController;
				console.log('Showing asteroid field game screen');
				break;

			case 'prime number game':
				// Start the game (which also shows the game screen)
				this.primeNumberGameController.getView().show();
				this.primeNumberGameController.startGame();
				this.activeController = this.primeNumberGameController;
				console.log('Showing prime number game screen');
				break;

			case 'mercury game':
				this.mercuryGameController.show();
				this.activeController = this.mercuryGameController;
				console.log('Showing mercury game screen');
				break;

			// case "result":
			// 	// Show results with the final score
			// 	this.resultsController.showResults(screen.score);
			// 	break;

			case 'earth':
				this.earthController.show();
				this.activeController = this.earthController;
				break;

			case 'knowledge':
				// This screen will be implemented later
				this.knowledgeController.show();
				this.activeController = this.knowledgeController;
				console.log('Showing knowledge screen');
				break;

			case 'military time game':
				this.militaryController.show();
				this.activeController = this.militaryController;
				break;
		}

		this.currentScreenType = screen.type;
		this.updateHelpButton(screen.type);
		const context = this.getHelpContext(screen.type);
		const slides = this.getHelpSlides(context || '');
		if (slides.length === 0) {
			console.log(`No help slides configured for ${screen.type}`);
			return;
		}
		this.showHelpOverlay(slides);

		// force redraw after switching screens
		this.layer.batchDraw();
	}

	/**
	 * Toggle pause state
	 * Pause menu can only be shown when not on the menu screen
	 */
	private togglePause(): void {
		// Don't allow pausing on menu screen
		if (this.activeController === this.menuController) {
			return;
		}

		this.isPaused = !this.isPaused;

		if (this.isPaused) {
			console.log('Pausing game');
			this.pauseMenuController.show();
			if (this.helpButtonGroup) {
				this.helpButtonGroup.visible(false);
				this.helpButtonGroup.listening(false);
			}
			if (this.activeController === this.mercuryGameController) {
				this.mercuryGameController.setInputVisible(false);
			}
		} else {
			console.log('Unpausing game');
			this.pauseMenuController.hide();
			if (this.activeController === this.mercuryGameController) {
				this.mercuryGameController.setInputVisible(true);
			}
			this.updateHelpButton(this.currentScreenType);
		}

		this.layer.batchDraw();
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

		this.layer.add(this.helpButtonGroup);

		void preloadImage('/assets/ui/HelpButton.png').then((img) => {
			helpButton.image(img);
			this.layer.batchDraw();
		});
	}

	private updateHelpButton(screenType: Screen['type']): void {
		if (!this.helpButtonGroup)
			return;
		const context = this.getHelpContext(screenType);
		this.currentHelpContext = context;
		if (!context) {
			this.hideHelpOverlay();
		}
		const visible = Boolean(context);
		this.helpButtonGroup.visible(visible);
		this.helpButtonGroup.listening(visible);
		this.layer.batchDraw();
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
		this.pauseMenuController.hide();
		this.isPaused = true;
		this.loadHelpSlide(this.helpSlideIndex);
		this.updateHelpNavigation();
		if (this.helpButtonGroup) {
			this.helpButtonGroup.listening(false);
		}
		// Hide input boxes when showing help (e.g., Mercury game)
		if (this.activeController && 'setInputVisible' in this.activeController) {
			(this.activeController as any).setInputVisible(false);
		}
		this.layer.batchDraw();
	}

	private hideHelpOverlay(): void {
		if (!this.helpOverlayGroup) return;
		this.helpOverlayGroup.visible(false);
		this.helpOverlayGroup.listening(false);
		this.isPaused = false;

		if (this.helpButtonGroup && this.currentHelpContext) {
			this.helpButtonGroup.listening(true);
		}
		// Restore input boxes when hiding help (e.g., Mercury game)
		if (this.activeController && 'setInputVisible' in this.activeController) {
			(this.activeController as any).setInputVisible(true);
		}
		this.helpSlides = [];
		this.helpSlideIndex = 0;
		if (this.helpPrevButton) this.helpPrevButton.visible(false);
		if (this.helpNextButton) this.helpNextButton.visible(false);
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

	private getHelpSlides(context: string): string[] {
		switch (context) {
			case 'Asteroid Field':
				return ['/assets/ui/AsteroidFieldHelp1.png', '/assets/ui/AsteroidFieldHelp2.png'];
			default:
				return [];
		}
	}
}

// Initialize the application
new App('container');
