import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { MenuScreenView } from './MenuScreenView.ts';
import { MenuScreenModel } from './MenuScreenModel.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { PlayerManager } from '../../core/movement/PlayerManager';
import { CollisionManager } from '../../core/collision/CollisionManager';
import { greenAlienSprite } from '../../core/sprites/AlienSprite';
import { PlayerConfig } from '../../configs/PlayerConfig';
import { ThemePanel } from '../../ui/ThemePanel';

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;
	private playerManager?: PlayerManager | null;
	private collisionManager?: CollisionManager | null;
	private model: MenuScreenModel;
	private themePanel: ThemePanel;

	/**
	 * Constructor for the MenuScreenController
	 * @param screenSwitcher - The screen switcher
	 */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new MenuScreenView(() => this.handleStartClick());
		// create model for the menu and pass player model into the player manager
		this.model = new MenuScreenModel(STAGE_WIDTH / 4, 250);
		// Controller owns the PlayerManager wiring; pass the model so state persists here
		this.collisionManager = new CollisionManager();
		this.playerManager = new PlayerManager({
			group: this.view.getGroup(),
			spriteConfig: greenAlienSprite,
			x: this.model.player.x,
			y: this.model.player.y,
			walkSpeed: PlayerConfig.MOVEMENT.WALK_SPEED,
			model: this.model.player,
			collisionManager: this.collisionManager,
		});

		// Add theme panel
		this.themePanel = new ThemePanel();
		this.view.getGroup().add(this.themePanel.getGroup());
	}

	/**
	 * Handle start button click
	 */
	private handleStartClick(): void {
		this.screenSwitcher.switchToScreen({ type: 'game' });
	}

	/**
	 * Get the view
	 * @returns The view of the menu screen controller
	 */
	getView(): MenuScreenView {
		return this.view;
	}

<<<<<<< HEAD
	destroy(): void {
		super.destroy();
		this.themePanel.destroy();
	}

=======
	/**
	 * Show the menu screen controller
	 */
>>>>>>> origin/main
	override show(): void {
		super.show();
		// nothing else here; per-frame updates run from App's central loop
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
			// run collision checks for this screen
			this.collisionManager?.update();
			// redraw layer
			this.view.getGroup().getLayer()?.draw();
		}
	}
}
