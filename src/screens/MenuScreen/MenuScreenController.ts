import { ScreenController } from "../../types.ts";
import type { ScreenSwitcher } from "../../types.ts";
import { MenuScreenView } from "./MenuScreenView.ts";
import { MenuScreenModel } from "./MenuScreenModel.ts";
import { STAGE_WIDTH } from "../../constants.ts";
import { PlayerManager } from "../../core/movement/PlayerManager";

/**
 * MenuScreenController - Handles menu interactions
 */
export class MenuScreenController extends ScreenController {
	private view: MenuScreenView;
	private screenSwitcher: ScreenSwitcher;
	private playerManager?: PlayerManager | null;
	private model: MenuScreenModel;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new MenuScreenView(() => this.handleStartClick());
		// create model for the menu and pass player model into the player manager
		this.model = new MenuScreenModel(STAGE_WIDTH / 4, 250);
		// Controller owns the PlayerManager wiring; pass the model so state persists here
		this.playerManager = new PlayerManager({
			group: this.view.getGroup(),
			imageUrl: "/assets/sprites/luffy.png",
			scale: 0.2,
			speed: 250,
			model: this.model.player,
		});
	}

	/**
	 * Handle start button click
	 */
	private handleStartClick(): void {
		// TODO: Task 1 - Implement screen transition from menu to game
		this.screenSwitcher.switchToScreen({ type: "game" });
	}

	/**
	 * Get the view
	 */
	getView(): MenuScreenView {
		return this.view;
	}

	override show(): void {
		super.show();
		// nothing else here; per-frame updates run from App's central loop
	}

	override hide(): void {
		super.hide();
		// nothing else here; movement will not be updated while hidden
	}

	override update(deltaTime: number): void {
		// Only update the player manager when the view is visible
		if (this.view.getGroup().visible()) {
			this.playerManager?.update(deltaTime);
			// redraw layer
			this.view.getGroup().getLayer()?.draw();
		}
	}
}