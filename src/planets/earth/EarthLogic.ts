import Konva from 'konva';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';

export class EarthLogic {
	private group: Konva.Group;
	private hourHand!: Konva.Line;
	private minuteHand!: Konva.Line;

	constructor(group: Konva.Group) {
		this.group = group;
	}

	initializeClock(): void {
		const centerX = STAGE_WIDTH / 2;
		const centerY = STAGE_HEIGHT / 2;

		// Draw clock face centered
		const clockFace = new Konva.Circle({
			x: centerX,
			y: centerY,
			radius: 150,
			stroke: 'white',
			strokeWidth: 4,
		});
		this.group.add(clockFace);

		// Draw numbers 1–12 around the clock
		for (let n = 1; n <= 12; n++) {
			const angle = (n / 12) * 2 * Math.PI;
			const radius = 120; // distance from center
			const x = centerX + radius * Math.sin(angle);
			const y = centerY - radius * Math.cos(angle);

			const number = new Konva.Text({
				x,
				y,
				text: n.toString(),
				fontSize: 20,
				fontFamily: 'Arial',
				fill: 'white',
			});
			number.offsetX(number.width() / 2);
			number.offsetY(number.height() / 2);
			this.group.add(number);
		}
		// Hour hand
		this.hourHand = new Konva.Line({
			points: [centerX, centerY, centerX, centerY - 80],
			stroke: 'white',
			strokeWidth: 6,
			lineCap: 'round',
		});
		this.group.add(this.hourHand);

		// Minute hand
		this.minuteHand = new Konva.Line({
			points: [centerX, centerY, centerX, centerY - 120],
			stroke: 'white',
			strokeWidth: 3,
			lineCap: 'round',
		});
		this.group.add(this.minuteHand);

		this.group.getLayer()?.batchDraw();
	}

	/**
	 * Updates the clock hands to a given time (hour, minute)
	 */
	setClockTime(hour: number, minute: number): void {
		const centerX = STAGE_WIDTH / 2;
		const centerY = STAGE_HEIGHT / 2;

		// Each hour = 30°, each minute = 6°
		const hourAngle = ((hour % 12) + minute / 60) * 30;
		const minuteAngle = minute * 6;

		const hourLength = 80;
		const minuteLength = 120;

		const hourX = centerX + hourLength * Math.sin((Math.PI / 180) * hourAngle);
		const hourY = centerY - hourLength * Math.cos((Math.PI / 180) * hourAngle);

		const minuteX = centerX + minuteLength * Math.sin((Math.PI / 180) * minuteAngle);
		const minuteY = centerY - minuteLength * Math.cos((Math.PI / 180) * minuteAngle);

		this.hourHand.points([centerX, centerY, hourX, hourY]);
		this.minuteHand.points([centerX, centerY, minuteX, minuteY]);
		this.group.getLayer()?.batchDraw();
	}
}
