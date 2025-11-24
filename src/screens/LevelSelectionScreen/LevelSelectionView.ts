// src/screens/level-selection/LevelSelectionView.ts

import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { createButton } from '../../ui';
import { preloadImage } from '../../core/utils/AssetLoader';

/**
 * LevelSelectionView - Renders the level selection screen
 */
export class LevelSelectionView implements View {
	private group: Konva.Group;
	private buttonGroup?: Konva.Group;

	constructor(
		onLevel1Click: () => void,
		onLevel2Click: () => void,
		onLevel3Click: () => void,
		onBackToMenu: () => void,
		onLevel5Click: () => void
	) {
		this.group = new Konva.Group({
			visible: true,
			id: 'levelSelectionScreen',
		});

		//-------------------------------------------------------
		// Background
		//-------------------------------------------------------
		const background = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			listening: false,
			image: new Image(),
		});

		void preloadImage('/assets/ui/MainMenuBG.png').then((img) => {
			background.image(img);
			this.group.getLayer()?.batchDraw();
		});

		this.group.add(background);

		//-------------------------------------------------------
		// Button container
		//-------------------------------------------------------
		const buttonGroup = new Konva.Group({ listening: true });

		const baseX = STAGE_WIDTH / 2 - 200;
		let y = 350;

		const level1Btn = createButton({
			x: baseX,
			y,
			width: 400,
			height: 60,
			text: 'ASTROID GAME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onLevel1Click,
		});

		y += 75;
		const level2Btn = createButton({
			x: baseX,
			y,
			width: 400,
			height: 60,
			text: 'PRIME NUMBER GAME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onLevel2Click,
		});

		y += 75;
		const level3Btn = createButton({
			x: baseX,
			y,
			width: 400,
			height: 60,
			text: 'MILITARY TIME GAME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onLevel3Click,
		});

		y += 75;
		const backBtn = createButton({
			x: baseX,
			y,
			width: 400,
			height: 60,
			text: 'MERCURY GAME',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onBackToMenu,
		});

		y += 75;
		const level5Btn = createButton({
			x: baseX,
			y,
			width: 400,
			height: 60,
			text: 'VENUS MATH MISSION',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onLevel5Click,
		});

		buttonGroup.add(level1Btn);
		buttonGroup.add(level2Btn);
		buttonGroup.add(level3Btn);
		buttonGroup.add(backBtn);
		buttonGroup.add(level5Btn);

		this.buttonGroup = buttonGroup;
		this.group.add(buttonGroup);
	}

	//-------------------------------------------------------
	// View Methods
	//-------------------------------------------------------
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	ensureButtonsOnTop(): void {
		if (this.buttonGroup) {
			this.buttonGroup.moveToTop();
		}
	}
}
