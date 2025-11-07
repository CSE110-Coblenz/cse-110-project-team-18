import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { MenuScreenView } from './MenuScreenView.ts';
import { MenuScreenModel } from './MenuScreenModel.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { PlayerManager } from '../../core/managers/PlayerManager';
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
	private readonly initialPlayerPosition = {
		x: STAGE_WIDTH / 4,
		y: 250,
	};

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new MenuScreenView(() => this.handleAsteriodFieldClick(), () => this.handlePrimeGameClick());
		this.model = new MenuScreenModel(this.initialPlayerPosition.x, this.initialPlayerPosition.y);
	}

	private initializePlayer(): void {
		if (this.playerManager) return;

		this.collisionManager = new CollisionManager();
		const alienWalkSpeed = 150;
		this.model.player = { ...this.initialPlayerPosition };
		this.playerManager = new PlayerManager({
			group: this.view.getGroup(),
			spriteConfig: greenAlienSprite,
			x: this.model.player.x,
			y: this.model.player.y,
			walkSpeed: alienWalkSpeed,
			model: this.model.player,
			collisionManager: this.collisionManager,
		});
	}

	private disposePlayer(): void {
		this.playerManager?.dispose();
		this.playerManager = null;
		this.collisionManager = null;
	}

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

	override show(): void {
		super.show();
		this.initializePlayer();
		this.view.ensureButtonsOnTop();
	}

	override hide(): void {
		super.hide();
		this.disposePlayer();
	}

	override update(deltaTime: number): void {
		if (this.view.getGroup().visible()) {
			this.playerManager?.update(deltaTime);
			this.collisionManager?.update();
			this.view.ensureButtonsOnTop();
			this.view.getGroup().getLayer()?.draw();
		}
	}

	dispose(): void {
		this.disposePlayer();
	}
}
