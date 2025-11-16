import Konva from 'konva';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';

export class EarthGameView {
	private group: Konva.Group;
	private hourHand: Konva.Line;
	private minuteHand: Konva.Line;

	constructor(parentGroup: Konva.Group) {
		this.group = new Konva.Group({ id: 'earthClockGroup' });
		parentGroup.add(this.group);

		const centerX = STAGE_WIDTH / 2;
		const centerY = STAGE_HEIGHT / 2;

		// Clock face
		const clockFace = new Konva.Circle({
			x: centerX,
			y: centerY,
			radius: 120,
			stroke: 'white',
			strokeWidth: 4,
		});
		this.group.add(clockFace);

		// Create hour and minute hands
		this.hourHand = new Konva.Line({
			points: [centerX, centerY, centerX, centerY - 50],
			stroke: 'white',
			strokeWidth: 6,
			lineCap: 'round',
			offsetY: 0, // important for rotation
		});
		this.group.add(this.hourHand);

		this.minuteHand = new Konva.Line({
			points: [centerX, centerY, centerX, centerY - 80],
			stroke: 'white',
			strokeWidth: 3,
			lineCap: 'round',
			offsetY: 0,
		});
		this.group.add(this.minuteHand);

		this.group.getLayer()?.draw();
	}

	/** Sets the clock hands to a given time */
	setHands(hour: number, minute: number): void {
		const minuteAngle = (minute / 60) * 360;
		const hourAngle = (hour % 12) * 30 + (minute / 60) * 0.5;

		const centerX = STAGE_WIDTH / 2;
		const centerY = STAGE_HEIGHT / 2;

		this.minuteHand.rotation(minuteAngle);
		this.hourHand.rotation(hourAngle);
		this.minuteHand.position({ x: centerX, y: centerY });
		this.hourHand.position({ x: centerX, y: centerY });
		this.group.getLayer()?.batchDraw();
	}
}
