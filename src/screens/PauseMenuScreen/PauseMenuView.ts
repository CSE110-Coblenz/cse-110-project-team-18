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
	 * PauseMenuView constructor
	 * @param onResumeClick - callback for resume button
	 * @param onSaveClick - callback for save button
	 * @param onMainMenuClick - callback for main menu button
	 */
	constructor(onResumeClick: () => void, onSaveClick: () => void, onMainMenuClick: () => void) {
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

		//-------------------------------------------------------
		// Resume Button
		//-------------------------------------------------------
		const resumeBtn = createButton({
			x: STAGE_WIDTH / 2 - 200,
			y: STAGE_HEIGHT / 2 - 30,
			width: 400,
			height: 60,
			text: 'RESUME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onResumeClick,
		});

		//-------------------------------------------------------
		// Save Button
		//-------------------------------------------------------
		const saveBtn = createButton({
			x: STAGE_WIDTH / 2 - 200,
			y: STAGE_HEIGHT / 2 + 50,
			width: 400,
			height: 60,
			text: 'SAVE',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onSaveClick,
		});

		//-------------------------------------------------------
		// Main Menu Button
		//-------------------------------------------------------
		const mainMenuBtn = createButton({
			x: STAGE_WIDTH / 2 - 200,
			y: STAGE_HEIGHT / 2 + 130,
			width: 400,
			height: 60,
			text: 'MAIN MENU',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onMainMenuClick,
		});

		//-------------------------------------------------------
		// Add buttons to group
		//-------------------------------------------------------
		this.buttonGroup.add(resumeBtn);
		this.buttonGroup.add(saveBtn);
		this.buttonGroup.add(mainMenuBtn);
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
