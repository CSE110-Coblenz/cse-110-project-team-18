import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { AsteroidFieldGameView } from './AsteroidFieldGameView.ts';
import { AsteroidFieldGameModel } from './AsteroidFieldGameModel.ts';
import { PlayerManager } from '../../core/managers/PlayerManager';
import { CollisionManager } from '../../core/collision/CollisionManager';
import { spaceshipSprite } from '../../core/sprites/SpaceshipSprite';
import { createHorizontalMovementConfig } from '../../configs/MovementConfig';
import { ProjectileManager } from '../../core/managers/ProjectileManager';
import { InputManager } from '../../core/input/InputManager';
import { ProjectileConfig } from '../../configs/ProjectileConfig';
import { STAGE_WIDTH } from '../../configs/GameConfig';

/**
 * AsteroidFieldGameController - Handles asteroid field game interactions
 */
export class AsteroidFieldGameController extends ScreenController {
	private view: AsteroidFieldGameView;
	private screenSwitcher: ScreenSwitcher;
	private model: AsteroidFieldGameModel;
	private playerManager?: PlayerManager | null;
	private collisionManager?: CollisionManager | null;
	private projectileManager?: ProjectileManager | null;
	private inputManager: InputManager;
	private fireCooldownMs = ProjectileConfig.FIRE_COOLDOWN_MS;
	private timeSinceLastShot = ProjectileConfig.INITIAL_TIME_SINCE_LAST_SHOT;
	private projectileOffsetY = ProjectileConfig.OFFSET_Y;
	private readonly initialPlayerPosition = { x: STAGE_WIDTH / 2, y: 700 };

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new AsteroidFieldGameView(() => this.handleReturnToMenuClick());
		this.inputManager = InputManager.getInstance();
		this.model = new AsteroidFieldGameModel(
			this.initialPlayerPosition.x,
			this.initialPlayerPosition.y
		);
	}

	private initializeManagers(): void {
		if (this.playerManager) return;

		this.collisionManager = new CollisionManager();

		this.model.player = { ...this.initialPlayerPosition };
		const spaceshipWalkSpeed = 800;
		this.playerManager = new PlayerManager({
			group: this.view.getGroup(),
			spriteConfig: spaceshipSprite,
			x: this.model.player.x,
			y: this.model.player.y,
			walkSpeed: spaceshipWalkSpeed,
			model: this.model.player,
			collisionManager: this.collisionManager,
			movementConfig: createHorizontalMovementConfig(spaceshipWalkSpeed),
		});

		this.projectileManager = new ProjectileManager({
			group: this.view.getGroup(),
			collisionManager: this.collisionManager,
			imageUrl: '/assets/sprites/laser_shot_sprite.png',
			speed: 1000,
			scale: 0.2,
			direction: ProjectileConfig.DIRECTION,
			bounds: ProjectileConfig.BOUNDS,
		});

		this.timeSinceLastShot = Number.POSITIVE_INFINITY;
	}

	private disposeManagers(): void {
		this.playerManager?.dispose();
		this.playerManager = null;
		this.projectileManager?.dispose();
		this.projectileManager = null;
		this.collisionManager = null;
	}

	private handleReturnToMenuClick(): void {
		this.screenSwitcher.switchToScreen({ type: 'menu' });
	}

	getView(): AsteroidFieldGameView {
		return this.view;
	}

	override show(): void {
		super.show();
		this.initializeManagers();
	}

	override hide(): void {
		super.hide();
		this.disposeManagers();
	}

	override update(deltaTime: number): void {
		if (this.view.getGroup().visible()) {
			this.playerManager?.update(deltaTime);
			this.timeSinceLastShot += deltaTime;

			if (this.projectileManager && this.playerManager) {
				const playerCollidable = this.playerManager.getPlayerCollidable();
				if (playerCollidable) {
					this.projectileManager.setPlayerCollidable(playerCollidable);
				}
			}

			const spacebarPressed = this.inputManager.isKeyPressed(' ');
			if (spacebarPressed && this.timeSinceLastShot >= this.fireCooldownMs && this.model.player) {
				this.projectileManager?.shoot({
					x: this.model.player.x,
					y: this.model.player.y + this.projectileOffsetY,
				});
				this.timeSinceLastShot = 0;
			}

			this.projectileManager?.update(deltaTime);

			this.collisionManager?.update();
			this.view.ensureButtonsOnTop();
			this.view.getGroup().getLayer()?.draw();
		}
	}

	dispose(): void {
		this.disposeManagers();
	}
}
