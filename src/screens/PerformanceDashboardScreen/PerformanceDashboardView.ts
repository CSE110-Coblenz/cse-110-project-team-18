import Konva from 'konva';
import type { View } from '../../types';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { createButton } from '../../ui';
import { theme } from '../../configs/ThemeConfig';
import { preloadImage } from '../../core/utils/AssetLoader';

export class PerformanceDashboardView implements View {
	private group: Konva.Group;
	private onBack: () => void;

	constructor(onBack: () => void) {
		this.group = new Konva.Group({ visible: false });
		this.onBack = onBack;
	}

	getGroup() {
		return this.group;
	}

	show() {
		this.group.visible(true);
		this.group.getLayer()?.batchDraw();
	}

	hide() {
		this.group.visible(false);
		this.group.destroyChildren();
	}

	clear() {
		this.group.destroyChildren();
	}

	render(rows: any[]) {
		this.clear();

		// ============================
		// BACKGROUND IMAGE
		// ============================
		const bg = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			listening: false,
			image: new Image(),
		});

		// Load actual image
		void preloadImage('/assets/ui/EarthBG.png').then((img) => {
			bg.image(img);
			this.group.getLayer()?.batchDraw();
		});

		this.group.add(bg);

		// ============================
		// TITLE
		// ============================
		const title = new Konva.Text({
			text: 'Performance Dashboard',
			x: STAGE_WIDTH / 2,
			y: 40,
			width: STAGE_WIDTH,
			align: 'center',
			fontSize: 40,
			fill: theme.get('white'),
		});
		title.offsetX(STAGE_WIDTH / 2);
		this.group.add(title);

		let y = 150;

		for (const row of rows) {
			this.renderRow(row, y);
			y += 100; // compact spacing
		}

		// ============================
		// BACK BUTTON
		// ============================
		const backBtn = createButton({
			x: STAGE_WIDTH - 260,
			y: STAGE_HEIGHT - 90,
			width: 240,
			height: 60,
			text: 'BACK',
			colorKey: 'primary',
			hoverColorKey: 'primary_hover',
			onClick: this.onBack,
		});
		this.group.add(backBtn);

		this.group.getLayer()?.batchDraw();
	}

	private renderRow(row: any, y: number) {
		const label = new Konva.Text({
			text: row.label,
			x: 50,
			y,
			fontSize: 28,
			fill: theme.get('white'),
		});
		this.group.add(label);

		const barBgX = 500;

		// Accuracy bar background
		const barBg = new Konva.Rect({
			x: barBgX,
			y: y + 10,
			width: 300,
			height: 25,
			fill: '#333',
			cornerRadius: 6,
		});
		this.group.add(barBg);

		// Accuracy bar fill
		const barFill = new Konva.Rect({
			x: barBgX,
			y: y + 10,
			width: 300 * row.accuracy,
			height: 25,
			fill: row.passed ? 'green' : 'red',
			cornerRadius: 6,
		});
		this.group.add(barFill);

		// Score text
		const scoreText = new Konva.Text({
			text: `${row.score}/${row.total}`,
			x: barBgX + 330,
			y,
			fontSize: 24,
			fill: theme.get('info'),
		});
		this.group.add(scoreText);
	}
}
