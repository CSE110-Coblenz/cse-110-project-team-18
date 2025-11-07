import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { AsteroidFieldGameView } from './AsteroidFieldGameView.ts';
import { AsteroidFieldGameModel } from './AsteroidFieldGameModel.ts';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { PlayerManager } from '../../core/movement/PlayerManager';
import { CollisionManager } from '../../core/collision/CollisionManager';
import { spaceshipSprite } from '../../core/sprites/SpaceshipSprite';
import { createHorizontalMovementConfig } from '../../configs/MovementConfig';

/**
 * AsteroidFieldGameController - Handles asteroid field game interactions
 */
export class AsteroidFieldGameController extends ScreenController {
	private view: AsteroidFieldGameView;
	private screenSwitcher: ScreenSwitcher;
	private model: AsteroidFieldGameModel;
	private playerManager?: PlayerManager | null;
	private collisionManager?: CollisionManager | null;

	/**
	 * Constructor for the AsteroidFieldGameController
	 * @param screenSwitcher - The screen switcher
	 */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new AsteroidFieldGameView(() => this.handleReturnToMenuClick());

		// Create model with player at bottom center of screen
		this.model = new AsteroidFieldGameModel(STAGE_WIDTH / 2, STAGE_HEIGHT - 500);
		this.collisionManager = new CollisionManager();

		// Create player manager with spaceship sprite and horizontal-only movement (A/D keys only)
		const spaceshipWalkSpeed = 800;
		this.playerManager = new PlayerManager({
			group: this.view.getGroup(),
			spriteConfig: spaceshipSprite,
			// player is guaranteed to be defined since we passed x and y to constructor
			x: this.model.player!.x,
			y: this.model.player!.y,
			walkSpeed: spaceshipWalkSpeed,
			model: this.model.player!,
			collisionManager: this.collisionManager,
			movementConfig: createHorizontalMovementConfig(spaceshipWalkSpeed),
		});
	}

	/**
	 * Handle return to menu button click
	 */
	private handleReturnToMenuClick(): void {
		this.screenSwitcher.switchToScreen({ type: 'menu' });
	}

	/**
	 * Get the view
	 * @returns The view of the asteroid field game controller
	 */
	getView(): AsteroidFieldGameView {
		return this.view;
	}

	/**
	 * Show the asteroid field game screen controller
	 */
	override show(): void {
		super.show();
		// Additional initialization can be added here as needed
	}

	/**
	 * Hide the asteroid field game screen controller
	 */
	override hide(): void {
		super.hide();
		// Cleanup can be added here as needed
	}

	/**
	 * Update the asteroid field game screen controller
	 * @param deltaTime - The time since the last frame in milliseconds
	 */
	override update(deltaTime: number): void {
		// Only update the player manager when the view is visible
		if (this.view.getGroup().visible()) {
			this.playerManager?.update(deltaTime);
			this.collisionManager?.update();
			this.view.getGroup().getLayer()?.draw();
		}
	}

	/**
	 * Dispose of resources when the controller is destroyed
	 */
	dispose(): void {
		this.playerManager?.dispose();
		this.playerManager = null;
	}
}