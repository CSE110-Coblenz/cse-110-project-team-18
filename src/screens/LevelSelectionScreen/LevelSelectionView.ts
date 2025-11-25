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
		onLevel5Click: () => void,
		onCheckProgressClick: () => void
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

		// -------------------------------------------------------
		// CHECK PROGRESS BUTTON (bottom-right corner)
		// -------------------------------------------------------
		const progressBtn = createButton({
			x: STAGE_WIDTH - 360,
			y: STAGE_HEIGHT - 90,
			width: 320,
			height: 60,
			text: 'CHECK PROGRESS',
			colorKey: 'accent_blue',
			hoverColorKey: 'accent_blue_hover',
			onClick: onCheckProgressClick,
		});

		// Add first so it stays behind the floating player / top buttons
		this.group.add(progressBtn);

		//-------------------------------------------------------
		// SPECIAL EFFECTS FOR PROGRESS BUTTON
		//-------------------------------------------------------

		const pulse = () => {
			progressBtn.to({
				scaleX: 1.07,
				scaleY: 1.07,
				duration: 0.6,
				easing: Konva.Easings.EaseInOut,
				onFinish: () => {
					progressBtn.to({
						scaleX: 1,
						scaleY: 1,
						duration: 0.6,
						easing: Konva.Easings.EaseInOut,
						onFinish: pulse,
					});
				},
			});
		};

		pulse(); // start the loop

		// Hover pop-out
		progressBtn.on('mouseenter', () => {
			progressBtn.to({
				scaleX: 1.12,
				scaleY: 1.12,
				shadowBlur: 25,
				duration: 0.15,
			});
		});

		// Hover leave
		progressBtn.on('mouseleave', () => {
			progressBtn.to({
				scaleX: 1,
				scaleY: 1,
				shadowBlur: 15,
				duration: 0.15,
			});
		});

		// Click bounce
		progressBtn.on('mousedown', () => {
			progressBtn.to({
				scaleX: 0.92,
				scaleY: 0.92,
				duration: 0.1,
			});
		});
		progressBtn.on('mouseup', () => {
			progressBtn.to({
				scaleX: 1.12,
				scaleY: 1.12,
				duration: 0.1,
			});
		});

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
			text: 'ASTEROID GAME',
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
