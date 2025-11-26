import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { PauseMenuView } from './PauseMenuView.ts';
import { PauseMenuModel } from './PauseMenuModel.ts';

/**
 * PauseMenuController - Handles pause menu interactions
 */
export class PauseMenuController extends ScreenController {
	private view: PauseMenuView;
	private screenSwitcher: ScreenSwitcher;
	private model: PauseMenuModel;
	private onResumeCallback?: () => void;

	constructor(screenSwitcher: ScreenSwitcher, onResume?: () => void) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.onResumeCallback = onResume;

		this.view = new PauseMenuView(
			() => this.handleResumeClick(),
			() => this.handleSaveClick(),
			() => this.handleLevelSelectionClick(),
			() => this.handleLogoutClick()
		);

		this.model = new PauseMenuModel();
	}

	// ---------------------------------------------------------
	// BUTTON HANDLERS
	// ---------------------------------------------------------
	private handleResumeClick(): void {
		if (this.onResumeCallback) {
			this.onResumeCallback();
		}
		this.hide();
	}

	private handleSaveClick(): void {
		console.log('Save clicked - save functionality to be implemented');
		alert('Save functionality will be implemented soon!');
	}

	private handleLevelSelectionClick(): void {
		this.hide();
		this.screenSwitcher.switchToScreen({ type: 'level selection' });
	}

	private handleLogoutClick(): void {
		this.hide();
		this.screenSwitcher.switchToScreen({ type: 'menu' });
	}

	// ---------------------------------------------------------
	// VIEW IMPLEMENTATION
	// ---------------------------------------------------------
	getView(): PauseMenuView {
		return this.view;
	}

	override show(): void {
		super.show();
		this.view.getGroup().moveToTop();
		// Notify active game controllers
		document.dispatchEvent(new Event('pauseMenuOpened'));
	}

	override hide(): void {
		super.hide();
		// Notify controllers the game resumed
		document.dispatchEvent(new Event('pauseMenuClosed'));
	}
}
