import { Collidable } from '../objects/Collidable';

/**
 * CollisionManager is a class that manages collisions between items.
 */
export class CollisionManager {
	private items = new Set<Collidable>();
	private movedItems = new Set<Collidable>();

	/**
	 * Register an item to the collision manager
	 * @param item - The item to register
	 */
	register(item: Collidable) {
		this.items.add(item);
	}

	/**
	 * Unregister an item from the collision manager
	 * @param item - The item to unregister
	 */
	unregister(item: Collidable) {
		this.items.delete(item);
		this.movedItems.delete(item);
	}

	/**
	 * Mark an item as moved
	 * @param item - The item to mark as moved
	 */
	markMoved(item: Collidable) {
		if (this.items.has(item)) {
			this.movedItems.add(item);
		}
	}

	/**
	 * Update the collision manager
	 */
	update() {
		// Moved items are checked against ALL items
		for (const moved of this.movedItems) {
			for (const other of this.items) {
				if (moved === other) continue;
				if (moved.intersects(other)) {
					moved.owner.onCollision?.(other.owner);
					other.owner.onCollision?.(moved.owner);
				}
			}
		}

		// Clear moved items for next frame
		this.movedItems.clear();
	}
}
