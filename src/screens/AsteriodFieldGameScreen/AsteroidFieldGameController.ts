import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { AsteroidFieldGameView } from './AsteroidFieldGameView.ts';
import { AsteroidFieldGameModel } from './AsteroidFieldGameModel.ts';
import { spaceshipSprite } from '../../core/sprites/SpaceshipSprite';
import { createHorizontalMovementConfig } from '../../configs/MovementConfig';
import { ProjectileManager } from '../../core/managers/ProjectileManager';
import { AsteroidManager } from '../../core/managers/AsteroidManager';
import { InputManager } from '../../core/input/InputManager';
import { ProjectileConfig } from '../../configs/ProjectileConfig';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { createPlayerManager } from '../../core/factories/PlayerManagerFactory';
import { ScreenEntityManager } from '../../core/utils/ScreenEntityManager';
import { CollisionManager } from '../../core/collision/CollisionManager';
import { ProgressManager } from '../../core/managers/ProgressManager'; // Needed for Performance Dashboard

/**
 * AsteroidFieldGameController - Handles asteroid field game interactions
 Notes for the team:
 --> currently, this game has *no end condition*. It runs forever.
 --> a future PR can add the threshold functionality mentioned on discord
 --> once an end condition exists, we can call ProgressManager.setResult()
	 the same way it was done for the other games.

 --> I am adding a simple "done" condition ONLY so I can retrieve score/accuracy
	 data for the PerformanceDashboard. This is NOT the final end-condition for 
	 the game. This placeholder exists so we can score/retrieve progress 
	 consistently acfross all our games.

 */

export class AsteroidFieldGameController extends ScreenController {
	private view: AsteroidFieldGameView;
	private screenSwitcher: ScreenSwitcher;
	private model: AsteroidFieldGameModel;
	private inputManager: InputManager;
	private readonly projectilePreset = ProjectileConfig.variants.laser;
	private readonly initialPlayerPosition = { x: STAGE_WIDTH / 2, y: 700 };
	private targetNumber = 1;
	private readonly maxAsteroidValue = 50;
	private entityLifecycle: ScreenEntityManager<{
		playerManager: ReturnType<typeof createPlayerManager>['playerManager'];
		projectileManager: ProjectileManager;
		asteroidManager: AsteroidManager;
		collisionManager: CollisionManager;
	}>;
	/**
	 * TEMPORARY: End condition so we can record progress
	 * Once the final design is decided, replace this.
	 */
	private readonly TEMP_END_THRESHOLD = 30; // Points needed to end the game
	private hasRecordedResult = false; // Prevent double saving

	/**
	 * AsteroidFieldGameController - The controller for the asteroid field game screen
	 * @param screenSwitcher - The screen switcher
	 */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new AsteroidFieldGameView();
		this.inputManager = InputManager.getInstance();
		this.model = new AsteroidFieldGameModel(
			this.initialPlayerPosition.x,
			this.initialPlayerPosition.y
		);
		this.entityLifecycle = new ScreenEntityManager({
			create: () => {
				this.targetNumber = this.getRandomTargetNumber();
				this.model.score = 0;
				this.view.setTargetNumber(this.targetNumber);
				this.view.setScore(this.model.score);

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
				const asteroidManager = new AsteroidManager({
					group: this.view.getGroup(),
					collisionManager,
					speed: 200,
					scale: 0.8,
					spawnIntervalMs: 2000,
					targetNumber: this.targetNumber,
					maxValue: this.maxAsteroidValue,
					onAsteroidHit: (isFactor: boolean) => {
						this.handleAsteroidHit(isFactor);
					},
					onAsteroidReachedBottom: (isFactor: boolean) => {
						this.handleAsteroidReachedBottom(isFactor);
					},
				});
				return { playerManager, projectileManager, asteroidManager, collisionManager };
			},
			dispose: ({ playerManager, projectileManager, asteroidManager }) => {
				playerManager.dispose();
				projectileManager.dispose();
				asteroidManager.dispose();
			},
		});
	}

	/**
	 * Handle the return to menu click
	 */
	private handleReturnToMenuClick(): void {
		this.screenSwitcher.switchToScreen({ type: 'menu' });
	}

	/**
	 * Get the view of the asteroid field game screen
	 * @returns The view of the asteroid field game screen
	 */
	getView(): AsteroidFieldGameView {
		return this.view;
	}

	/**
	 * Show the asteroid field game screen
	 */
	override show(): void {
		super.show();
		this.entityLifecycle.ensure();
	}

	/**
	 * Hide the asteroid field game screen
	 */
	override hide(): void {
		super.hide();
		this.entityLifecycle.dispose();
	}

	/**
	 * Update the asteroid field game screen
	 * @param deltaTime - The time since the last frame in milliseconds
	 */
	override update(deltaTime: number): void {
		if (!this.view.getGroup().visible()) return;
		const entities = this.entityLifecycle.get();
		if (!entities) return;

		entities.playerManager.update(deltaTime);
		entities.projectileManager.update(deltaTime);
		entities.asteroidManager.update(deltaTime);
		entities.collisionManager.update();
		this.view.update(deltaTime);

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

	/**
	 * Dispose of the asteroid field game controller
	 */
	dispose(): void {
		this.entityLifecycle.dispose();
	}

	private getRandomTargetNumber(): number {
		return Math.floor(Math.random() * 10) + 1;
	}

	private handleAsteroidHit(isFactor: boolean): void {
		if (isFactor) {
			this.model.score += 2;
			this.view.flashScreenEdge(true);
		} else {
			this.model.score -= 2;
			this.view.flashScreenEdge(false);
		}
		this.view.setScore(this.model.score);

		// === TEMP END CONDITION ===
		this.checkEndCondition();
	}

	private handleAsteroidReachedBottom(isFactor: boolean): void {
		if (isFactor) {
			this.model.score -= 1;
			this.view.flashScreenEdge(false);
		} else {
			this.model.score += 1;
			this.view.flashScreenEdge(true);
		}
		this.view.setScore(this.model.score);

		// === TEMP END CONDITION ===
		this.checkEndCondition();
	}

	/**
	 * TEMP: Check if the game should end so we can save progress.
	 * Replace this with actual end-game logic once the team decides.
	 */
	private checkEndCondition(): void {
		if (this.hasRecordedResult) return; // avoid multiple triggers

		if (Math.abs(this.model.score) >= this.TEMP_END_THRESHOLD) {
			this.hasRecordedResult = true;

			const score = this.model.score;
			const maxScore = this.TEMP_END_THRESHOLD;

			// === SAVE PROGRESS TO PERFORMANCE DASHBOARD ===
			const pm = ProgressManager.getInstance();
			pm.setResult('asteroid_factor', {
				label: 'Asteroid Factor Field',
				score,
				total: maxScore,
				accuracy: Math.min(Math.abs(score) / maxScore, 1),
				played: true,
				passed: score >= 0, // TEMP: passing means final score is positive
			});

			// OPTIONAL: Show a temp "Done" screen or go back to level select
			this.screenSwitcher.switchToScreen({ type: 'level selection' });
		}
	}
}
