import Konva from 'konva';
import type { View } from '../../types';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { createButton } from '../../ui';
import { theme } from '../../configs/ThemeConfig';
import { preloadImage } from '../../core/utils/AssetLoader';

export class KnowledgeScreenView implements View {
	private group: Konva.Group;
	private onTestKnowledge: () => void;
	private onMenuClick: () => void;

	constructor(_onNextSlide: () => void, onTestKnowledge: () => void, onMenuClick: () => void) {
		this.group = new Konva.Group({
			visible: false,
			id: 'knowledgeScreen',
		});

		this.onTestKnowledge = onTestKnowledge;
		this.onMenuClick = onMenuClick;
	}

	renderSlide(slide: { title: string; text: string }, _isLast: boolean): void {
		this.group.destroyChildren();

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

		// --- RETURN TO MENU (bottom-left) ---
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

		// --- HEADER BAR ---
		const headerBg = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: 70,
			fill: theme.get('cosmic_purple'),
		});
		this.group.add(headerBg);

		// --- TITLE ---
		const titleText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 18,
			text: 'Military Time Training 🚀',
			fontSize: 40,
			fontFamily: theme.fontFamilyDefault,
			fill: theme.get('white'),
			align: 'center',
			width: STAGE_WIDTH - 40,
		});
		titleText.offsetX((STAGE_WIDTH - 40) / 2);
		this.group.add(titleText);

		// --- MAIN BODY TEXT ---
		const bodyText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 110,
			text: slide.text,
			fontSize: 38,
			fontFamily: theme.fontFamilyDefault,
			fill: theme.get('white'),
			align: 'center',
			width: STAGE_WIDTH - 80,
		});
		bodyText.offsetX((STAGE_WIDTH - 80) / 2);
		this.group.add(bodyText);

		// --- TEST YOUR KNOWLEDGE BUTTON ---
		const testBtn = createButton({
			x: STAGE_WIDTH - 280 - 30,
			y: STAGE_HEIGHT - 90,

			width: 280,
			height: 60,
			text: 'Test Your Knowledge',
			colorKey: 'cosmic_purple',
			hoverColorKey: 'accent_blue',
			onClick: this.onTestKnowledge,
		});

		this.group.add(testBtn);

		testBtn.to({
			scaleX: 1.05,
			scaleY: 1.05,
			duration: 1,
			yoyo: true,
			repeat: Infinity,
		});

		this.group.getLayer()?.draw();
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
