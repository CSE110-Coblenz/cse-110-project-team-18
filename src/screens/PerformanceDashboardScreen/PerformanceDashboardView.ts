import Konva from 'konva';
import type { View } from '../../types';

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
				x: 275,
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
