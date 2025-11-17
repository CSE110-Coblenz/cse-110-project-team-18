import Konva from 'konva';
import type { View } from '../../types';
import { STAGE_WIDTH } from '../../configs/GameConfig';

/**
 * EarthScreenView - Renders the Earth screen
 */
export class EarthScreenView implements View {
	private group: Konva.Group;

	constructor() {
		this.group = new Konva.Group({
			visible: false,
			id: 'earthScreen',
		});

		// centered title text
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 80,
			text: '🌍⏰ Time Crunch',
			fontSize: 36,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});

		// Center horizontally by offsetting half its width
		title.offsetX(title.width() / 2);

		this.group.add(title);
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
