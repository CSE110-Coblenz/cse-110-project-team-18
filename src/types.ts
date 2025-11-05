import type { Group } from 'konva/lib/Group';

export interface View {
	getGroup(): Group;
	show(): void;
	hide(): void;
}

/**
 * Screen types for navigation
 *
 * - "menu": Main menu screen
 * - "game": Gameplay screen
 * - "result": Results screen with final score
 *   - score: Final score to display on results screen
 */
export type Screen =
	| { type: 'menu' }
	| { type: 'game' }
	| { type: 'earth' } // added earth screen type
	| { type: 'result'; score: number };

export abstract class ScreenController {
	abstract getView(): View;

	show(): void {
		this.getView().show();
	}

	hide(): void {
		this.getView().hide();
	}

	/**
	 * Update loop called by the App. deltaTime is milliseconds since last frame.
	 */
	update(_deltaTime: number): void {
		// default no-op; override in controllers that need per-frame updates
	}
}

export interface ScreenSwitcher {
	switchToScreen(screen: Screen): void;
}
