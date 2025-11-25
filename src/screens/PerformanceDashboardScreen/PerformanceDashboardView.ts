import Konva from 'konva';
import type { View } from '../../types';
import { preloadImage } from '../../core/utils/AssetLoader';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';

export class PerformanceDashboardView implements View {
	private group: Konva.Group;

	constructor() {
		this.group = new Konva.Group({ visible: false });
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.batchDraw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.destroyChildren(); // optional: wipe old bars
		this.group.getLayer()?.batchDraw();
	}

	render(data: { topic: string; accuracy: number }[]): void {
		this.group.destroyChildren();

		// background
		const background = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			listening: false,
			image: new Image(),
		});

		void preloadImage('/assets/ui/MercuryBG.png').then((img) => {
			background.image(img);
			this.group.getLayer()?.batchDraw();
		});

		this.group.add(background);
		// title and bars
		const title = new Konva.Text({
			x: 50,
			y: 20,
			text: 'Performance Dashboard',
			fontSize: 32,
			fill: 'white',
		});

		this.group.add(title);

		let y = 100;

		data.forEach((d) => {
			const label = new Konva.Text({
				x: 50,
				y,
				text: `${d.topic}: ${Math.round(d.accuracy * 100)}%`,
				fontSize: 22,
				fill: 'white',
			});

			const bar = new Konva.Rect({
				x: 330,
				y,
				width: d.accuracy * 300,
				height: 25,
				fill: d.accuracy >= 0.6 ? 'green' : 'red',
			});

			this.group.add(label);
			this.group.add(bar);

			y += 50;
		});

		this.group.getLayer()?.draw();
	}
}
