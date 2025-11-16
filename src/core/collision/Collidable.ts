import type { GameObject } from '../objects/GameObject';

export type Rect = { x: number; y: number; w: number; h: number };
export type Circle = { x: number; y: number; r: number };

/**
 * Collidable - A class that represents a collidable object
 */
export class Collidable {
	owner: GameObject;
	shape: Rect | Circle | null = null;

	/**
	 * Constructor for the Collidable
	 * @param owner - The owner of the collidable object
	 */
	constructor(owner: GameObject) {
		this.owner = owner;
	}

	/**
	 * Set the rectangle shape of the collidable object
	 * @param x - The x position of the rectangle
	 * @param y - The y position of the rectangle
	 * @param w - The width of the rectangle
	 * @param h - The height of the rectangle
	 */
	setRect(x: number, y: number, w: number, h: number): void {
		this.shape = { x, y, w, h };
	}

	/**
	 * Set the circle shape of the collidable object
	 * @param x - The x position of the circle
	 * @param y - The y position of the circle
	 * @param r - The radius of the circle
	 */
	setCircle(x: number, y: number, r: number): void {
		this.shape = { x, y, r };
	}

	/**
	 * Check if the collidable object intersects with another collidable object
	 * @param other - The other collidable object
	 * @returns True if the collidable object intersects with the other collidable object
	 */
	intersects(other: Collidable): boolean {
		if (!this.shape || !other.shape) return false;

		const a = this.shape;
		const b = other.shape;

		// both rect (AABB)
		if (isRect(a) && isRect(b)) {
			return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
		}

		// both circle
		if (isCircle(a) && isCircle(b)) {
			const dx = a.x - b.x;
			const dy = a.y - b.y;
			const r = a.r + b.r;
			return dx * dx + dy * dy <= r * r;
		}

		// mixed types: approximate by bounding boxes
		const ra = boundingBox(a);
		const rb = boundingBox(b);
		return !(ra.x + ra.w < rb.x || rb.x + rb.w < ra.x || ra.y + ra.h < rb.y || rb.y + rb.h < ra.y);
	}
}

/**
 * Check if the shape is a rectangle
 * @param s - The shape
 * @returns True if the shape is a rectangle
 */
function isRect(s: any): s is Rect {
	return s && typeof (s as Rect).w === 'number';
}

/**
 * Check if the shape is a circle
 * @param s - The shape
 * @returns True if the shape is a circle
 */
function isCircle(s: any): s is Circle {
	return s && typeof (s as Circle).r === 'number';
}

/**
 * Get the bounding box of the shape
 * @param s - The shape
 * @returns The bounding box
 */
function boundingBox(s: Rect | Circle): Rect {
	if (isRect(s)) return s;
	return { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 };
}
