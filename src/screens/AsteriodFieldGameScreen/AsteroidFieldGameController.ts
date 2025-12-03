import { ScreenController } from '../../types.ts'; // Types and Interfaces
import type { ScreenSwitcher } from '../../types.ts';

import { AsteroidFieldGameView } from './AsteroidFieldGameView.ts'; // Local Components
import { AsteroidFieldGameModel } from './AsteroidFieldGameModel.ts';

import { ProjectileManager } from '../../core/managers/ProjectileManager'; // Managers
import { AsteroidManager } from '../../core/managers/AsteroidManager';
import { ProgressManager } from '../../core/managers/ProgressManager';

import { STAGE_WIDTH } from '../../configs/GameConfig'; // Configs
import { ProjectileConfig } from '../../configs/ProjectileConfig';
import { createHorizontalMovementConfig } from '../../configs/MovementConfig';

import { InputManager } from '../../core/input/InputManager'; // Core Utilities
import { CollisionManager } from '../../core/collision/CollisionManager';
import { ScreenEntityManager } from '../../core/utils/ScreenEntityManager';
import { createPlayerManager } from '../../core/factories/PlayerManagerFactory';
import { spaceshipSprite } from '../../core/sprites/SpaceshipSprite';

/** same API base pattern as other controllers */
const API_BASE = 'http://localhost:3000/api';

/**
 * AsteroidFieldGameController - Handles asteroid field game interactions
 * 
 * Game ends when the player reaches or exceeds END_SCORE.
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

		// Entity lifecycle manager
		this.entityLifecycle = new ScreenEntityManager({
			create: () => {
				const newTargetNumber = this.getRandomTargetNumber();
				this.model.reset(newTargetNumber);
				this.isGameStopped = false;
				this.hasRecordedResult = false;
				this.view.setMaxScore(AsteroidFieldGameController.END_SCORE);
				this.view.setTargetNumber(this.model.targetNumber);
				this.view.setScore(this.model.score);
				this.view.hideReturnButton();
				
				// Create player
				this.model.player = { ...this.initialPlayerPosition };
				const collisionManager = new CollisionManager();
				const { playerManager } = createPlayerManager({
					group: this.view.getGroup(),
					spriteConfig: spaceshipSprite,
					position: this.initialPlayerPosition,
					walkSpeed: 800,
					model: this.model.player,
					movementConfig: createHorizontalMovementConfig(800),
					collisionManager,
				});
				
				// Create projectile manager
				const projectileManager = new ProjectileManager({
					group: this.view.getGroup(),
					collisionManager,
					imageUrl: this.projectilePreset.imageUrl,
					speed: this.projectilePreset.speed,
					scale: this.projectilePreset.scale,
					direction: this.projectilePreset.direction,
					bounds: this.projectilePreset.bounds,
				});

				// Set player collidable on projectile manager
				const initialCollidable = playerManager.getPlayerCollidable();
				if (initialCollidable) {
					projectileManager.setPlayerCollidable(initialCollidable);
				}

				// Create asteroid manager
				const asteroidManager = new AsteroidManager({
					group: this.view.getGroup(),
					collisionManager,
					speed: 200,
					scale: 0.8,
					spawnIntervalMs: 2000,
					targetNumber: this.model.targetNumber,
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

		// Update entities
		const entities = this.entityLifecycle.get();
		if (!entities) return;

		entities.playerManager.update(deltaTime);
		entities.projectileManager.update(deltaTime);
		entities.asteroidManager.update(deltaTime);
		entities.collisionManager.update();
		this.view.update(deltaTime);

		// Set player collidable on projectile manager
		const playerCollidable = entities.playerManager.getPlayerCollidable();
		if (playerCollidable) {
			entities.projectileManager.setPlayerCollidable(playerCollidable);
		}

		// Shoot projectile
		if (this.model.player && this.inputManager.consumePress(' ', this.projectilePreset.fireCooldownMs)) {
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

	/**
	 * Get a random target number for the asteroid field game
	 * @returns A random target number between 1 and 10
	 */
	private getRandomTargetNumber(): number {
		return Math.floor(Math.random() * 10) + 1;
	}

	/**
	 * Clamp score to ensure it doesn't go below zero or above the maximum score
	 */
	private clampScore(): void {
		this.model.score = Math.max(this.model.score, 0);
		this.model.score = Math.min(this.model.score, AsteroidFieldGameController.END_SCORE);
	}

	/**
	 * Handle when an asteroid is hit
	 * @param isFactor - Whether the asteroid is a factor or not
	 */
	private handleAsteroidHit(isFactor: boolean): void {
		if (isFactor) {
			// Correct: shooting a factor asteroid
			this.model.score += 2;
			this.model.incrementCorrect();
			this.view.flashScreenEdge(true);
		} else {
			// Incorrect: shooting a non-factor asteroid
			this.model.score -= 2;
			this.model.incrementIncorrect();
			this.view.flashScreenEdge(false);
		}

		this.clampScore();
		this.view.setScore(this.model.score);
		this.checkEndCondition();
	}

	/**
	 * Handle when an asteroid reaches the bottom of the screen
	 * @param isFactor - Whether the asteroid is a factor or not
	 */
	private handleAsteroidReachedBottom(isFactor: boolean): void {
		if (isFactor) {
			// Incorrect: letting a factor asteroid reach bottom
			this.model.score -= 1;
			this.model.incrementIncorrect();
			this.view.flashScreenEdge(false);
		} else {
			// Correct: letting a non-factor asteroid reach bottom
			this.model.score += 1;
			this.model.incrementCorrect();
			this.view.flashScreenEdge(true);
		}

		this.clampScore();
		this.view.setScore(this.model.score);
		this.checkEndCondition();
	}

	/**
	 * Save the final score and accuracy to the database
	 * @param finalScore - The final score achieved
	 * @param accuracy - The accuracy percentage (0-1)
	 */
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
	 * Check if the game should end when score reaches or exceeds END_SCORE
	 */
	private checkEndCondition(): void {
		if (this.hasRecordedResult) return; // avoid multiple triggers

		if (this.model.score >= AsteroidFieldGameController.END_SCORE) {
			this.hasRecordedResult = true;
			this.isGameStopped = true;

			const score = this.model.score
			const maxScore = AsteroidFieldGameController.END_SCORE;
			const passed = score === maxScore;
			const accuracy = this.model.getAccuracy();

			// Save progress to performance dashboard
			const pm = ProgressManager.getInstance();
			pm.setResult('asteroid_factor', {
				label: 'Asteroid Factor Field',
				score,
				total: maxScore,
				accuracy: accuracy,
				played: true,
				passed,
			});

			// Save to DB so this level counts as completed
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
