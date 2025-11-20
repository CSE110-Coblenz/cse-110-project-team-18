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

		// PAUSE MENU VIEW with THREE BUTTON HANDLERS
		this.view = new PauseMenuView(
			() => this.handleResumeClick(),
			() => this.handleSaveClick(),
			() => this.handleMainMenuClick()
		);

		// PAUSE MENU MODEL
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
		// TODO: Implement save functionality
		console.log('Save clicked - save functionality to be implemented');
		// For now, just show a message
		alert('Save functionality will be implemented soon!');
	}

	private handleMainMenuClick(): void {
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
		// Ensure pause menu is always on top
		this.view.getGroup().moveToTop();
	}

	override hide(): void {
		super.hide();
	}
}

