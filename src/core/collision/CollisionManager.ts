import { Collidable } from '../objects/Collidable';

export class CollisionManager {
	private items: Collidable[] = [];

	register(item: Collidable) {
		if (!this.items.includes(item)) this.items.push(item);
	}

	unregister(item: Collidable) {
		this.items = this.items.filter((i) => i !== item);
	}

	update() {
		// naive O(n^2) collision checking
		for (let i = 0; i < this.items.length; i++) {
			for (let j = i + 1; j < this.items.length; j++) {
				const a = this.items[i];
				const b = this.items[j];
				if (a.intersects(b)) {
					a.owner.onCollision?.(b.owner);
					b.owner.onCollision?.(a.owner);
				}
			}
		}
	}
}
