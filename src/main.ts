import Konva from 'konva';
import { MenuScreenController } from './screens/MenuScreen/MenuScreenController.ts';
import { AsteroidFieldGameController } from './screens/AsteriodFieldGameScreen/AsteroidFieldGameController.ts';
import type { ScreenSwitcher, Screen, ScreenController } from './types.ts';
import { STAGE_WIDTH, STAGE_HEIGHT } from './configs/GameConfig';
import { InputManager } from './core/input/InputManager';
import { PrimeNumberGameController } from './screens/PrimeNumberGameScreen/PrimeNumberGameController.ts';

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
	// private gameController: GameScreenController;
	// private resultsController: ResultsScreenController;

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
		// this.gameController = new GameScreenController(this);
		// this.resultsController = new ResultsScreenController(this);

		// Add all screen groups to the layer
		// All screens exist simultaneously but only one is visible at a time
		this.layer.add(this.menuController.getView().getGroup());
		this.layer.add(this.primeNumberGameController.getView().getGroup());
		this.layer.add(this.asteroidFieldGameController.getView().getGroup());
		// this.layer.add(this.gameController.getView().getGroup());
		// this.layer.add(this.resultsController.getView().getGroup());

		// Draw the layer (render everything to the canvas)
		this.layer.draw();

		// Start with menu screen visible and set it as the active controller
		this.switchToScreen({ type: 'menu' });

		// Start central game loop that updates only the active controller
		let lastTime = performance.now();
		const loop = (now: number) => {
			const dt = now - lastTime; // ms
			lastTime = now;
			if (this.activeController) {
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
		// Hide all screens first by setting their Groups to invisible
		this.menuController.hide();
		this.primeNumberGameController.hide();
		this.asteroidFieldGameController.hide();
		// this.gameController.hide();
		// this.resultsController.hide();

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

			// case "result":
			// 	// Show results with the final score
			// 	this.resultsController.showResults(screen.score);
			// 	break;
		}
	}
}

// Initialize the application
new App('container');
