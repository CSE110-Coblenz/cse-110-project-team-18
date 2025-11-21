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
			this.pauseMenuController.show();
			if (this.helpButtonGroup) {
				this.helpButtonGroup.visible(false);
				this.helpButtonGroup.listening(false);
			}
			if (this.activeController === this.mercuryGameController) {
				this.mercuryGameController.setInputVisible(false);
			}
		} else {
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
				console.log(`${this.currentHelpContext} help button pressed`);
			}
		});

		this.layer.add(this.helpButtonGroup);

		void preloadImage('/assets/ui/HelpButton.png').then((img) => {
			helpButton.image(img);
			this.layer.batchDraw();
		});
	}

	private updateHelpButton(screenType: Screen['type']): void {
		if (!this.helpButtonGroup) return;
		const context = this.getHelpContext(screenType);
		this.currentHelpContext = context;
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
}

// Initialize the application
new App('container');
