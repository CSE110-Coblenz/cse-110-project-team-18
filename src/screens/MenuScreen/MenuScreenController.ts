import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { MenuScreenView } from './MenuScreenView.ts';
import { MenuScreenModel } from './MenuScreenModel.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { PlayerManager } from '../../core/movement/PlayerManager';
import { CollisionManager } from '../../core/collision/CollisionManager';
import { greenAlienSprite } from '../../core/sprites/AlienSprite';

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;
	private playerManager?: PlayerManager | null;
	private collisionManager?: CollisionManager | null;
	private model: MenuScreenModel;

	/**
	 * Constructor for the MenuScreenController
	 * @param screenSwitcher - The screen switcher
	 */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new MenuScreenView(
			this.handleAsteriodFieldClick.bind(this),
			this.handlePrimeGameClick.bind(this)
		);
		// create model for the menu and pass player model into the player manager
		this.model = new MenuScreenModel(STAGE_WIDTH / 4, 250);
		// Controller owns the PlayerManager wiring; pass the model so state persists here
		this.collisionManager = new CollisionManager();
		const alienWalkSpeed = 150; // Walk speed in pixels per second for alien character
		this.playerManager = new PlayerManager({
			group: this.view.getGroup(),
			spriteConfig: greenAlienSprite,
			x: this.model.player?.x ?? STAGE_WIDTH / 4,
			y: this.model.player?.y ?? 250,
			walkSpeed: alienWalkSpeed,
			model: this.model.player,
			collisionManager: this.collisionManager,
		});
	}

	/**
	 * Handle asteroid field game start button click
	 */
	private handleAsteriodFieldClick(): void {
		this.screenSwitcher.switchToScreen({ type: 'asteroid field game' });
	}

	/**
	 * Handle prime number game start button click
	 */
	private handlePrimeGameClick(): void {
		this.playerManager?.dispose();
		this.screenSwitcher.switchToScreen({ type: 'prime number game' });
	}

	/**
	 * Get the view
	 * @returns The view of the menu screen controller
	 */
	getView(): MenuScreenView {
		return this.view;
	}

	/**
	 * Show the menu screen controller
	 */
	override show(): void {
		super.show();
	}

	/**
	 * Hide the menu screen controller
	 */
	override hide(): void {
		super.hide();
		// nothing else here; movement will not be updated while hidden
	}

	/**
	 * Update the menu screen controller
	 * @param deltaTime - The time since the last frame in milliseconds
	 */
	override update(deltaTime: number): void {
		// Only update the player manager when the view is visible
		if (this.view.getGroup().visible()) {
			this.playerManager?.update(deltaTime);
			this.collisionManager?.update();
			this.view.ensureButtonsOnTop();
			this.view.getGroup().getLayer()?.draw();
		}
	}
}
