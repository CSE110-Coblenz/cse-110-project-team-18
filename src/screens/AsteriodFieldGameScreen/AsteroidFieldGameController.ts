import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { AsteroidFieldGameView } from './AsteroidFieldGameView.ts';
import { AsteroidFieldGameModel } from './AsteroidFieldGameModel.ts';
import { spaceshipSprite } from '../../core/sprites/SpaceshipSprite';
import { createHorizontalMovementConfig } from '../../configs/MovementConfig';
import { ProjectileManager } from '../../core/managers/ProjectileManager';
import { InputManager } from '../../core/input/InputManager';
import { ProjectileConfig } from '../../configs/ProjectileConfig';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { createPlayerManager } from '../../core/factories/PlayerManagerFactory';
import { ScreenEntityManager } from '../../core/utils/ScreenEntityManager';
import { CollisionManager } from '../../core/collision/CollisionManager';

/**
 * AsteroidFieldGameController - Handles asteroid field game interactions
 */
export class AsteroidFieldGameController extends ScreenController {
	private view: AsteroidFieldGameView;
	private screenSwitcher: ScreenSwitcher;
	private model: AsteroidFieldGameModel;
	private inputManager: InputManager;
	private readonly projectilePreset = ProjectileConfig.variants.laser;
	private readonly initialPlayerPosition = { x: STAGE_WIDTH / 2, y: 700 };
	private entityLifecycle: ScreenEntityManager<{
		playerManager: ReturnType<typeof createPlayerManager>['playerManager'];
		projectileManager: ProjectileManager;
		collisionManager: CollisionManager;
	}>;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new AsteroidFieldGameView(() => this.handleReturnToMenuClick());
		this.inputManager = InputManager.getInstance();
		this.model = new AsteroidFieldGameModel(
			this.initialPlayerPosition.x,
			this.initialPlayerPosition.y
		);
		this.entityLifecycle = new ScreenEntityManager({
			create: () => {
				this.model.player = { ...this.initialPlayerPosition };
				const collisionManager = new CollisionManager();
				const { playerManager, model } = createPlayerManager({
					group: this.view.getGroup(),
					spriteConfig: spaceshipSprite,
					position: this.initialPlayerPosition,
					walkSpeed: 800,
					model: this.model.player,
					movementConfig: createHorizontalMovementConfig(800),
					collisionManager,
				});
				this.model.player = model;
				const projectileManager = new ProjectileManager({
					group: this.view.getGroup(),
					collisionManager,
					imageUrl: this.projectilePreset.imageUrl,
					speed: this.projectilePreset.speed,
					scale: this.projectilePreset.scale,
					direction: this.projectilePreset.direction,
					bounds: this.projectilePreset.bounds,
				});
				const initialCollidable = playerManager.getPlayerCollidable();
				if (initialCollidable) {
					projectileManager.setPlayerCollidable(initialCollidable);
				}
				return { playerManager, projectileManager, collisionManager };
			},
			dispose: ({ playerManager, projectileManager }) => {
				playerManager.dispose();
				projectileManager.dispose();
			},
		});
	}

	private handleReturnToMenuClick(): void {
		this.screenSwitcher.switchToScreen({ type: 'menu' });
	}

	getView(): AsteroidFieldGameView {
		return this.view;
	}

	override show(): void {
		super.show();
		this.entityLifecycle.ensure();
	}

	override hide(): void {
		super.hide();
		this.entityLifecycle.dispose();
	}

	override update(deltaTime: number): void {
		if (!this.view.getGroup().visible()) return;
		const entities = this.entityLifecycle.get();
		if (!entities) return;

		entities.playerManager.update(deltaTime);
		entities.projectileManager.update(deltaTime);
		entities.collisionManager.update();

		const playerCollidable = entities.playerManager.getPlayerCollidable();
		if (playerCollidable) {
			entities.projectileManager.setPlayerCollidable(playerCollidable);
		}

		if (
			this.model.player &&
			this.inputManager.consumePress(' ', this.projectilePreset.fireCooldownMs)
		) {
			entities.projectileManager.shoot({
				x: this.model.player.x,
				y: this.model.player.y + this.projectilePreset.offsetY,
			});
		}

		this.view.ensureButtonsOnTop();
		this.view.getGroup().getLayer()?.draw();
	}

	dispose(): void {
		this.entityLifecycle.dispose();
	}
}
