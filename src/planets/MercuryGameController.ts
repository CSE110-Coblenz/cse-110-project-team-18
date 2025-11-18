import { ScreenController } from "../types";
import type { ScreenSwitcher } from "../types";
import { MercuryGameView } from "./MercuryGameView";
import { MercuryGameModel } from "./MercuryGameModel";

export class MercuryGameController extends ScreenController{
	private screenSwitcher: ScreenSwitcher;
	private view: MercuryGameView;
	private model: MercuryGameModel;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new MercuryGameView();
		this.model = new MercuryGameModel();
	}

	/**
	 * Handle the return to menu click
	 */
	// private handleReturnToMenuClick(): void {
	// 	this.screenSwitcher.switchToScreen({ type: 'menu' });
	// }

	getView(): MercuryGameView {
		return this.view;
	}

	show(): void {
		super.show();
	}

	hide(): void {
		super.hide();
	}

	update(_deltaTime: number): void {
		// nothing to update
	}
}
