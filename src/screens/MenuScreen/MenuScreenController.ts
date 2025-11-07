import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { MenuScreenView } from './MenuScreenView.ts';
import { MenuScreenModel } from './MenuScreenModel.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { greenAlienSprite } from '../../core/sprites/AlienSprite';
import { ScreenEntityManager } from '../../core/utils/ScreenEntityManager';
import { createPlayerManager } from '../../core/factories/PlayerManagerFactory';

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;
	private model: MenuScreenModel;
	private readonly initialPlayerPosition = {
		x: STAGE_WIDTH / 4,
		y: 250,
	};
	private playerLifecycle: ScreenEntityManager<{
		playerManager: ReturnType<typeof createPlayerManager>['playerManager'];
		collisionManager: ReturnType<typeof createPlayerManager>['collisionManager'];
	}>;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new MenuScreenView(() => this.handleAsteriodFieldClick(), () => this.handlePrimeGameClick());
		this.model = new MenuScreenModel(this.initialPlayerPosition.x, this.initialPlayerPosition.y);
		this.playerLifecycle = new ScreenEntityManager({
			create: () => {
				this.model.player = { ...this.initialPlayerPosition };
				const { playerManager, collisionManager, model } = createPlayerManager({
					group: this.view.getGroup(),
					spriteConfig: greenAlienSprite,
					position: this.initialPlayerPosition,
					walkSpeed: 150,
					model: this.model.player,
				});
				this.model.player = model;
				return { playerManager, collisionManager };
			},
			dispose: ({ playerManager }) => {
				playerManager.dispose();
			},
		});
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
		this.playerLifecycle.ensure();
		this.view.ensureButtonsOnTop();
	}

	override hide(): void {
		super.hide();
		this.playerLifecycle.dispose();
	}

	override update(deltaTime: number): void {
		if (!this.view.getGroup().visible()) return;
		const entities = this.playerLifecycle.get();
		if (!entities) return;

		entities.playerManager.update(deltaTime);
		entities.collisionManager.update();
		this.view.ensureButtonsOnTop();
		this.view.getGroup().getLayer()?.draw();
	}

	dispose(): void {
		this.playerLifecycle.dispose();
	}
}
