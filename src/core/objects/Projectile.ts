import Konva from 'konva';
import { GameObject, Vec2 } from './GameObject';
import { Collidable } from '../collision/Collidable';

/**
 * ProjectileBounds - The bounds of the projectile
 * @param width - The width of the bounds
 * @param height - The height of the bounds
 */
export interface ProjectileBounds {
	width: number;
	height: number;
}

/**
 * ProjectileOptions - Options for the projectile
 * @param speed - The speed of the projectile
 * @param direction - The direction of the projectile
 * @param bounds - The bounds of the projectile
 */
export interface ProjectileOptions {
	speed: number;
	direction: Vec2;
	bounds: ProjectileBounds;
}

/**
 * Normalize the direction of the projectile
 * @param direction - The direction of the projectile
 * @returns The normalized direction
 */
function normalizeDirection(direction: Vec2): Vec2 {
	const magnitude = Math.hypot(direction.x, direction.y);
	if (magnitude === 0) {
		return { x: 0, y: -1 };
	}
	return { x: direction.x / magnitude, y: direction.y / magnitude };
}

/**
 * Projectile - Generic moving projectile that travels in a straight line until destroyed or leaving bounds
 */
export class Projectile extends GameObject {
	collidable: Collidable | null = null;
	private speed: number;
	private direction: Vec2;
	private halfWidth = 0;
	private halfHeight = 0;
	private bounds: ProjectileBounds;
	private destroyed = false;

	constructor(id: string, x: number, y: number, options: ProjectileOptions) {
		super(id, x, y);
		this.speed = options.speed;
		this.direction = normalizeDirection(options.direction);
		this.bounds = options.bounds;
		this.collidable = new Collidable(this);
	}

	/**
	 * Attach a node to the projectile
	 * @param node - The node to attach
	 */
	attachNode(node: Konva.Node): void {
		super.attachNode(node);
		try {
			const image: any = node as any;
			const w = (image.width && image.width() * (image.scaleX ? image.scaleX() : 1)) || 0;
			const h = (image.height && image.height() * (image.scaleY ? image.scaleY() : 1)) || 0;
			this.halfWidth = w / 2;
			this.halfHeight = h / 2;
			if (this.collidable) {
				this.collidable.setRect(
					this.model.x - this.halfWidth,
					this.model.y - this.halfHeight,
					w,
					h
				);
			}
		} catch {
			// ignore measurement errors
		}
	}

	/**
	 * Update the projectile
	 * @param deltaTimeMs - The time since the last frame in milliseconds
	 */
	update(deltaTimeMs: number): void {
		if (this.destroyed) return;
		const dt = deltaTimeMs / 1000;
		this.model.x += this.direction.x * this.speed * dt;
		this.model.y += this.direction.y * this.speed * dt;

		if (this.isOutOfBounds()) {
			this.destroyed = true;
			return;
		}

		if (this.node) {
			this.node.x(this.model.x);
			this.node.y(this.model.y);
		}

		if (
			this.collidable &&
			this.collidable.shape &&
			(this.collidable.shape as any).w !== undefined
		) {
			const s = this.collidable.shape as any;
			s.x = this.model.x - s.w / 2;
			s.y = this.model.y - s.h / 2;
		}
	}

	/**
	 * Check if the projectile is out of bounds
	 * @returns True if the projectile is out of bounds, false otherwise
	 */
	private isOutOfBounds(): boolean {
		return (
			this.model.y + this.halfHeight < 0 ||
			this.model.y - this.halfHeight > this.bounds.height ||
			this.model.x + this.halfWidth < 0 ||
			this.model.x - this.halfWidth > this.bounds.width
		);
	}

	/**
	 * Check if the projectile is destroyed
	 * @returns True if the projectile is destroyed, false otherwise
	 */
	isDestroyed(): boolean {
		return this.destroyed;
	}

	/**
	 * Destroy the projectile
	 */
	destroy(): void {
		this.destroyed = true;
	}

	/**
	 * Dispose of the projectile
	 */
	dispose(): void {
		this.collidable = null;
		super.dispose();
	}
}
