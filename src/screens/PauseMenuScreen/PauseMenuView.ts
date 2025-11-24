import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { createButton } from '../../ui';

/**
 * PauseMenuView - Renders the pause menu overlay
 */
export class PauseMenuView implements View {
	private group: Konva.Group;
	private overlay: Konva.Rect;
	private buttonGroup: Konva.Group;

	/**
	 * @param onResumeClick - callback for resume button
	 * @param onSaveClick - callback for save button
	 * @param onLevelSelectionClick - callback for level selection button
	 * @param onLogoutClick - callback for log out button
	 */
	constructor(
		onResumeClick: () => void,
		onSaveClick: () => void,
		onLevelSelectionClick: () => void,
		onLogoutClick: () => void
	) {
		this.group = new Konva.Group({
			visible: false,
			id: 'pauseMenuScreen',
		});

		//-------------------------------------------------------
		// Semi-transparent dark overlay
		//-------------------------------------------------------
		this.overlay = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: 'rgba(0, 0, 0, 0.7)',
			listening: true,
		});
		this.group.add(this.overlay);

		//-------------------------------------------------------
		// Title
		//-------------------------------------------------------
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: STAGE_HEIGHT / 2 - 150,
			text: 'PAUSED',
			fontSize: 64,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
			fontStyle: 'bold',
		});
		title.offsetX(title.width() / 2);
		this.group.add(title);

		//-------------------------------------------------------
		// Button container
		//-------------------------------------------------------
		this.buttonGroup = new Konva.Group({ listening: true });

		const BUTTON_WIDTH = 400;
		const BUTTON_HEIGHT = 60;
		const GAP = 80; // vertical gap between buttons

		const x = STAGE_WIDTH / 2 - BUTTON_WIDTH / 2;
		let y = STAGE_HEIGHT / 2 - 30; // starting y (close to your original)

		//-------------------------------------------------------
		// Resume Button
		//-------------------------------------------------------
		const resumeBtn = createButton({
			x,
			y,
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			text: 'RESUME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onResumeClick,
		});
		y += GAP;

		//-------------------------------------------------------
		// Save Button
		//-------------------------------------------------------
		const saveBtn = createButton({
			x,
			y,
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			text: 'SAVE',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onSaveClick,
		});
		y += GAP;

		//-------------------------------------------------------
		// Level Selection Button
		//-------------------------------------------------------
		const levelSelectionBtn = createButton({
			x,
			y,
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			text: 'LEVEL SELECTION',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onLevelSelectionClick,
		});
		y += GAP;

		//-------------------------------------------------------
		// Log Out Button
		//-------------------------------------------------------
		const logoutBtn = createButton({
			x,
			y,
			width: BUTTON_WIDTH,
			height: BUTTON_HEIGHT,
			text: 'LOG OUT',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onLogoutClick,
		});

		//-------------------------------------------------------
		// Add buttons to group
		//-------------------------------------------------------
		this.buttonGroup.add(resumeBtn);
		this.buttonGroup.add(saveBtn);
		this.buttonGroup.add(levelSelectionBtn);
		this.buttonGroup.add(logoutBtn);
		this.group.add(this.buttonGroup);
	}

	//-------------------------------------------------------
	// View Methods
	//-------------------------------------------------------
	show(): void {
		this.group.visible(true);
		this.buttonGroup.moveToTop();
		this.group.moveToTop();
		this.group.getLayer()?.draw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}

/**
 * PauseMenuModel - The model for the pause menu screen
 */
export class PauseMenuModel {
	constructor() {}
}