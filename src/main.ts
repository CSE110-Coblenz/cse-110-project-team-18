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
import { HelpManager } from './core/managers/HelpManager';
import { PauseManager } from './core/managers/PauseManager';
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
	private helpManager: HelpManager;
	private pauseManager: PauseManager;

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

		// Initialize managers first (they need to be created before pause menu controller)
		this.helpManager = new HelpManager(this.layer);
		this.helpManager.setGetActiveController(() => this.activeController as any);

		this.pauseManager = new PauseManager(
			() => this.activeController !== this.menuController,
			() => {
				this.pauseMenuController.show();
				this.helpManager.hideHelpButton();
				if (this.activeController === this.mercuryGameController) {
					this.mercuryGameController.setInputVisible(false);
				}
			},
			() => {
				this.pauseMenuController.hide();
				if (this.activeController === this.mercuryGameController) {
					this.mercuryGameController.setInputVisible(true);
				}
				this.helpManager.showHelpButton();
			}
		);

		// Initialize pause menu controller with callback to pause manager
		this.pauseMenuController = new PauseMenuController(this, () => {
			this.pauseManager.togglePause();
		});

		// Set up help manager callbacks (needs pause manager and pause menu controller)
		this.helpManager.setOnHelpShown(() => {
			// Hide pause menu if it's showing, then pause silently (don't show pause menu)
			this.pauseMenuController.hide();
			this.pauseManager.setPausedSilently(true);
		});
		this.helpManager.setOnHelpHidden(() => {
			// Unpause silently when help is closed
			this.pauseManager.setPausedSilently(false);
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

		// Add help button after screens so it appears above them
		this.helpManager.addToLayer();

		// Add pause menu last so it appears on top
		this.layer.add(this.pauseMenuController.getView().getGroup());

		// Draw the layer (render everything to the canvas)
		this.layer.draw();

		// Start with menu screen visible and set it as the active controller
		this.switchToScreen({ type: 'menu' });

		// Start central game loop that updates only the active controller
		let lastTime = performance.now();
		const loop = (now: number) => {
			const dt = now - lastTime; // ms
			lastTime = now;

			// Check for ESC key press to toggle pause (only when not on menu screen)
			// If help overlay is visible, close it first
			if (this.helpManager.isHelpOverlayVisible()) {
				if (InputManager.getInstance().consumePress('escape', 200)) {
					this.helpManager.hideHelpOverlay();
				}
			} else {
				this.pauseManager.update();
			}

			// Only update active controller if not paused
			if (!this.pauseManager.isGamePaused() && this.activeController) {
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
		this.pauseManager.reset();

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

		this.helpManager.updateForScreen(screen.type);

		// force redraw after switching screens
		this.layer.batchDraw();
	}

}

// Initialize the application
new App('container');
