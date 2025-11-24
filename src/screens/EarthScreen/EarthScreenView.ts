import Konva from 'konva';
import type { View } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { createButton } from '../../ui';
import { preloadImage } from '../../core/utils/AssetLoader';

// --------------------------------------------------------
// EARTH SCREEN VIEW — FIXED VERSION
// --------------------------------------------------------
export class EarthScreenView implements View {
	private group: Konva.Group;
	private onMenuClick: () => void;

	/**
	 * EarthScreenView
	 * @param onMenuClick - callback for Return to Menu
	 */
	constructor(onMenuClick: () => void) {
		this.group = new Konva.Group({
			visible: false,
			id: 'earthScreen',
		});

		this.onMenuClick = onMenuClick;

		const background = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			listening: false,
			image: new Image(),
		});

		void preloadImage('/assets/ui/EarthBG.png').then((img) => {
			background.image(img);
			this.group.getLayer()?.batchDraw();
		});

		this.group.add(background);

		// --------------------------------------------------------
		// RETURN TO MENU BUTTON (BOTTOM-LEFT)
		// --------------------------------------------------------
		const returnBtn = createButton({
			x: 30,
			y: STAGE_HEIGHT - 90,
			width: 240,
			height: 55,
			text: 'RETURN TO MENU',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: this.onMenuClick,
		});

		this.group.add(returnBtn);
		returnBtn.moveToTop();
	}

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
}
