import Konva from 'konva';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';

type ShootingStar = {
	node: Konva.Group;
	vx: number;
	vy: number;
	lifeMs: number;
	ttlMs: number;
	tail: Konva.Line;
	baseTailLength: number;
};

/**
 * Lightweight ambient shooting star effect rendered on its own Konva layer.
 * Procedural sprites avoid heavy image usage while keeping motion lively.
 */
export class ShootingStarsLayer {
	private layer: Konva.Layer;
	private container: Konva.Group;
	private enabled = false;
	private spawnCooldownMs = 0;
	private stars: ShootingStar[] = [];
	private readonly maxStars = 16;

	constructor(stage: Konva.Stage) {
		this.layer = new Konva.Layer({ listening: false });
		this.container = new Konva.Group({ listening: false });
		this.layer.add(this.container);
		stage.add(this.layer);
	}

	getLayer(): Konva.Layer {
		return this.layer;
	}

	public show(): void {
		this.enabled = true;
		// bring above opaque backgrounds on the main layer
		this.layer.moveToTop();
		this.layer.visible(true);
	}

	public hide(): void {
		this.enabled = false;
		this.clear();
		this.layer.visible(false);
		this.layer.batchDraw();
	}

	public update(deltaTimeMs: number): void {
		if (!this.enabled) return;

		this.spawnCooldownMs = Math.max(0, this.spawnCooldownMs - deltaTimeMs);
		if (this.spawnCooldownMs <= 0 && this.stars.length < this.maxStars) {
			this.spawnStar();
			this.spawnCooldownMs = 320 + Math.random() * 360; // slightly denser
		}

		const dt = deltaTimeMs / 1000;
		this.stars = this.stars.filter((star) => {
			star.lifeMs -= deltaTimeMs;
			const progress = 1 - star.lifeMs / star.ttlMs; // 0=start, 1=end

			// Ease speed: slow at start/end, fastest mid-flight.
			const speedFactor = 0.65 + Math.sin(progress * Math.PI) * 0.55;

			const node = star.node;
			node.x(node.x() + star.vx * dt * speedFactor);
			node.y(node.y() + star.vy * dt * speedFactor);

			// Tail length easing: short on spawn/end, longest mid-flight.
			const lenFactor = 0.35 + Math.sin(progress * Math.PI) * 0.95;
			const L = star.baseTailLength * lenFactor;
			const tailAngleRad = 0; // base horizontal tail; group rotation will set direction
			const tailDx = -Math.cos(tailAngleRad) * L;
			const tailDy = -Math.sin(tailAngleRad) * L;
			star.tail.points([0, 0, tailDx, tailDy]);

			const opacity = Math.max(0, 1 - progress * 1.05);
			node.opacity(opacity);

			const outOfBounds =
				node.x() > STAGE_WIDTH + 140 ||
				node.x() < -180 ||
				node.y() > STAGE_HEIGHT + 140 ||
				node.y() < -180;
			if (star.lifeMs <= 0 || outOfBounds) {
				node.destroy();
				return false;
			}
			return true;
		});

		this.layer.batchDraw();
	}

	private clear(): void {
		this.stars.forEach((s) => s.node.destroy());
		this.stars = [];
		this.spawnCooldownMs = 0;
	}

	private spawnStar(): void {
		const speed = 220 + Math.random() * 160;
		const spawnFromLeft = Math.random() < 0.5;
		const startX = spawnFromLeft
			? STAGE_WIDTH * (-0.12 + Math.random() * 0.08) // near/just off left edge
			: STAGE_WIDTH * (-0.05 + Math.random() * 1.05); // anywhere along top
		const startY = spawnFromLeft
			? Math.random() * (STAGE_HEIGHT * 0.85)
			: STAGE_HEIGHT * (-0.08 + Math.random() * 0.12); // near/just off top edge

		// Aim generally bottom-right: 30 degrees from +X axis.
		const angleDeg = 30;
		const angleRad = (angleDeg * Math.PI) / 180;
		const vx = speed * Math.cos(angleRad);
		const vy = speed * Math.sin(angleRad);

		const ttlMs = 1700 + Math.random() * 900; // extended glide across

		const palette = [
			{ head: '#FFF6D7', tail: '#FFBA7A' },
			{ head: '#EAF6FF', tail: '#9CD3FF' },
			{ head: '#FBE0FF', tail: '#D3A8FF' },
			{ head: '#E9FFF0', tail: '#9EF0C6' },
			{ head: '#FFE6F4', tail: '#FFA1CD' },
		];
		const { head, tail } = palette[Math.floor(Math.random() * palette.length)];

		const baseTailLength = 140 + Math.random() * 110; // longer streaks
		const tailStrokeWidth = 3.2 + Math.random() * 1.6; // thicker for visibility

		const group = new Konva.Group({
			x: startX,
			y: startY,
			listening: false,
		});

		const tailNode = new Konva.Line({
			points: [0, 0, -baseTailLength, 0], // base orientation; group rotation sets final
			stroke: tail,
			strokeWidth: tailStrokeWidth,
			lineCap: 'round',
			lineJoin: 'round',
			opacity: 1,
			shadowBlur: 18,
			shadowColor: tail,
			shadowOpacity: 0.7,
		});
		group.add(tailNode);

		const headNode = new Konva.Circle({
			x: 4,
			y: 2,
			radius: 5.2 + Math.random() * 1.8,
			fill: head,
			shadowBlur: 18,
			shadowColor: head,
			shadowOpacity: 0.85,
		});
		group.add(headNode);

		group.rotation(angleDeg); // align with downward motion

		this.container.add(group);
		this.stars.push({
			node: group,
			vx,
			vy,
			lifeMs: ttlMs,
			ttlMs,
			tail: tailNode,
			baseTailLength,
		});
	}
}
