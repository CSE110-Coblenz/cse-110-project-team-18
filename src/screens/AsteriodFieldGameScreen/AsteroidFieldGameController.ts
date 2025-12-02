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

/** same API base pattern as other controllers */
const API_BASE = 'http://localhost:3000/api';

/**
 * AsteroidFieldGameController - Handles asteroid field game interactions
 * 
 * Game ends when the player reaches or exceeds END_SCORE (30 points).
 * When the end condition is met, the game stops and displays a button to
 * return to the level selector. Progress is saved to the Performance Dashboard
 * and the database.
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
	 * End condition: game ends when score reaches or exceeds this value
	 */
	public static readonly END_SCORE = 30; // Points needed to end the game
	private hasRecordedResult = false; // Prevent double saving
	private isGameStopped = false; // Track if game has been stopped
	private correctActions = 0; // Track number of correct actions
	private incorrectActions = 0; // Track number of incorrect actions

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
				this.isGameStopped = false;
				this.hasRecordedResult = false;
				this.correctActions = 0;
				this.incorrectActions = 0;
				this.view.setTargetNumber(this.targetNumber);
				this.view.setScore(this.model.score);
				this.view.hideReturnButton();

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
		
		// Stop game updates if game is stopped
		if (this.isGameStopped) {
			this.view.update(deltaTime);
			this.view.ensureButtonsOnTop();
			this.view.getGroup().getLayer()?.draw();
			return;
		}

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
			// Correct: shooting a factor asteroid
			this.model.score += 2;
			this.correctActions++;
			this.view.flashScreenEdge(true);
		} else {
			// Incorrect: shooting a non-factor asteroid
			this.model.score -= 2;
			this.incorrectActions++;
			this.view.flashScreenEdge(false);
		}
		this.view.setScore(this.model.score);

		// === TEMP END CONDITION ===
		this.checkEndCondition();
	}

	private handleAsteroidReachedBottom(isFactor: boolean): void {
		if (isFactor) {
			// Incorrect: letting a factor asteroid reach bottom
			this.model.score -= 1;
			this.incorrectActions++;
			this.view.flashScreenEdge(false);
		} else {
			// Correct: letting a non-factor asteroid reach bottom
			this.model.score += 1;
			this.correctActions++;
			this.view.flashScreenEdge(true);
		}
		this.view.setScore(this.model.score);

		// === TEMP END CONDITION ===
		this.checkEndCondition();
	}

	/** helper to save Asteroid Field score (planet_id = 5) */
	private async saveAsteroidScore(finalScore: number, accuracy: number): Promise<void> {
		const userId = (window as any).__CURRENT_USER_ID__ as number | undefined;
		if (!userId) {
			console.warn('[Asteroid] No current user ID; skipping DB save.');
			return;
		}

		try {
			const res = await fetch(`${API_BASE}/progress/update-score`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId,
					planetId: 5, // Asteroid Field = planet_id 5
					score: finalScore, // must be > 0 if you want "completed"
					accuracy: accuracy, // accuracy based on correct/incorrect actions
				}),
			});

			if (!res.ok) {
				console.error('[Asteroid] Failed to save score:', res.status, await res.text());
			} else {
				console.log('[Asteroid] Score saved successfully for user', userId);
			}
		} catch (err) {
			console.error('[Asteroid] Error saving score:', err);
		}
	}

	/**
	 * Check if the game should end when score reaches or exceeds 30
	 */
	private checkEndCondition(): void {
		if (this.hasRecordedResult) return; // avoid multiple triggers

		if (this.model.score >= AsteroidFieldGameController.END_SCORE) {
			this.hasRecordedResult = true;
			this.isGameStopped = true;

			const score = this.model.score;
			const maxScore = AsteroidFieldGameController.END_SCORE;
			const passed = score >= AsteroidFieldGameController.END_SCORE;

			// Calculate accuracy based on correct/incorrect actions
			const totalActions = this.correctActions + this.incorrectActions;
			const accuracy = totalActions > 0 
				? this.correctActions / totalActions 
				: 0;

			// === SAVE PROGRESS TO PERFORMANCE DASHBOARD ===
			const pm = ProgressManager.getInstance();
			pm.setResult('asteroid_factor', {
				label: 'Asteroid Factor Field',
				score,
				total: maxScore,
				accuracy: accuracy,
				played: true,
				passed,
			});

			// === SAVE TO DB so this level counts as completed ===
			if (passed && score > 0) {
				void this.saveAsteroidScore(score, accuracy);
			}

			// Show return button instead of automatically switching
			this.view.showReturnButton(() => {
				this.screenSwitcher.switchToScreen({ type: 'level selection' });
			});
		}
	}
}
