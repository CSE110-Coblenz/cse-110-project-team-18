// src/screens/level-selection/LevelSelectionController.ts

import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { LevelSelectionView } from './LevelSelectionView.ts';
import { LevelSelectionModel } from './LevelSelectionModel.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { greenAlienSprite } from '../../core/sprites/AlienSprite';
import { ScreenEntityManager } from '../../core/utils/ScreenEntityManager';
import { createPlayerManager } from '../../core/factories/PlayerManagerFactory';

export class LevelSelectionController extends ScreenController {
	private view: LevelSelectionView;
	private screenSwitcher: ScreenSwitcher;
	private model: LevelSelectionModel;

	private unlockedPlanets: Set<number> = new Set();

	// 1 Mercury, 2 Venus, 3 Earth, 4 Mars, 5 asteroidField
	private isPlanetUnlocked(planetId: number): boolean {
		// If there's no logged-in user, assume guest play → everything unlocked
		const currentUserId = (window as any).__CURRENT_USER_ID__ as number | undefined;
		if (!currentUserId) {
			return true; // guest mode: no locks
		}

		// Normal behavior for logged-in players:
		// Mercury is always unlocked as the first planet
		if (planetId === 1) return true;
		return this.unlockedPlanets.has(planetId);
	}

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

		this.view = new LevelSelectionView(
			() => this.handleAsteriodFieldClick(),
			() => this.handlePrimeGameClick(),
			() => this.handleEarthClick(),
			() => this.handleMercuryClick(),
			() => this.handleVenusClick(),
			() => this.handleCheckProgressClick()
		);

		this.model = new LevelSelectionModel(
			this.initialPlayerPosition.x,
			this.initialPlayerPosition.y
		);

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

	// ---------------------------------------------------------
	// BUTTON HANDLERS (now respect locked/unlocked state)
	// ---------------------------------------------------------
	private handleAsteriodFieldClick(): void {
		// asteroidField = planet_id 5
		if (!this.isPlanetUnlocked(5)) {
			console.log('Asteroid field is locked');
			return;
		}
		this.screenSwitcher.switchToScreen({ type: 'asteroid field game' });
	}

	private handlePrimeGameClick(): void {
		// assume prime game is your Mars "slot" (planet_id 4)
		if (!this.isPlanetUnlocked(4)) {
			console.log('Prime / Mars is locked');
			return;
		}
		this.screenSwitcher.switchToScreen({ type: 'prime number game' });
	}

	private handleEarthClick(): void {
		// Earth = planet_id 3
		if (!this.isPlanetUnlocked(3)) {
			console.log('Earth is locked');
			return;
		}
		this.screenSwitcher.switchToScreen({ type: 'knowledge' });
	}

	private handleMercuryClick(): void {
		// Mercury = planet_id 1 (always unlocked)
		if (!this.isPlanetUnlocked(1)) {
			console.log('Mercury is locked (should not happen)');
			return;
		}
		this.screenSwitcher.switchToScreen({ type: 'mercury game' });
	}

	private handleVenusClick(): void {
		// Venus = planet_id 2
		if (!this.isPlanetUnlocked(2)) {
			console.log('Venus is locked');
			return;
		}
		this.screenSwitcher.switchToScreen({ type: 'venus game' });
	}

	private handleCheckProgressClick(): void {
		this.screenSwitcher.switchToScreen({ type: 'performance dashboard' });
	}

	// ---------------------------------------------------------
	// FETCH UNLOCKED PLANETS FROM BACKEND
	// ---------------------------------------------------------
	private async refreshLockStateForUser(userId: number): Promise<void> {
		try {
			const res = await fetch(`http://localhost:3000/api/progress/unlocked-planets/${userId}`);
			if (!res.ok) {
				console.error('Failed to fetch unlocked planets', res.statusText);
				return;
			}
			const data = (await res.json()) as { unlockedPlanets: number[] };
			console.log('Unlocked planets from server:', data.unlockedPlanets);

			this.unlockedPlanets = new Set(data.unlockedPlanets);

			// tell view to update visuals
			this.view.setLockState(data.unlockedPlanets);
		} catch (err) {
			console.error('Error fetching unlocked planets:', err);
		}
	}

	// ---------------------------------------------------------
	// VIEW IMPLEMENTATION
	// ---------------------------------------------------------
	getView(): LevelSelectionView {
		return this.view;
	}

	override show(): void {
		super.show();
		this.playerLifecycle.ensure();
		this.view.ensureButtonsOnTop();

		const currentUserId = (window as any).__CURRENT_USER_ID__ as number | undefined;
		if (currentUserId) {
			// Logged-in user → fetch unlocks from DB
			void this.refreshLockStateForUser(currentUserId);
		} else {
			// Guest mode → no DB, all planets unlocked via isPlanetUnlocked()
			console.log('[LevelSelection] Guest play: all planets unlocked');
		}
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
