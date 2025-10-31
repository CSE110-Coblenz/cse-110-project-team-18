import type { GameObject } from './GameObject';

export type Rect = { x: number; y: number; w: number; h: number };
export type Circle = { x: number; y: number; r: number };

export class Collidable {
	owner: GameObject;
	shape: Rect | Circle | null = null;

	constructor(owner: GameObject) {
		this.owner = owner;
	}

	setRect(x: number, y: number, w: number, h: number): void {
		this.shape = { x, y, w, h };
	}

	setCircle(x: number, y: number, r: number): void {
		this.shape = { x, y, r };
	}

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

function isRect(s: any): s is Rect {
	return s && typeof (s as Rect).w === 'number';
}

function isCircle(s: any): s is Circle {
	return s && typeof (s as Circle).r === 'number';
}

function boundingBox(s: Rect | Circle): Rect {
	if (isRect(s)) return s;
	return { x: s.x - s.r, y: s.y - s.r, w: s.r * 2, h: s.r * 2 };
}
