import Konva from 'konva';

export type Vec2 = { x: number; y: number };

/**
 * Base GameObject
 * Lightweight container for entity state. Rendering is optional via a Konva node.
 */
export abstract class GameObject {
	id: string;
	model: Vec2;
	visible: boolean;
	protected node: Konva.Node | null = null;

	/**
	 * Constructor for the GameObject
	 * @param id - The id of the game object
	 * @param x - The x position of the game object
	 * @param y - The y position of the game object
	 */
	constructor(id: string, x = 0, y = 0) {
		this.id = id;
		this.model = { x, y };
		this.visible = true;
	}

	/**
	 * Update the game object
	 * @param deltaTimeMs - The time since the last frame in milliseconds
	 */
	update(_deltaTimeMs: number): void {
		// default no-op
	}

	/**
	 * Attach a node to the game object
	 * @param node - The node to attach
	 */
	attachNode(node: Konva.Node): void {
		this.node = node;
	}

	/**
	 * Get the node of the game object
	 * @returns The node of the game object
	 */
	getNode(): Konva.Node | null {
		return this.node;
	}

	/**
	 * Dispose of the game object
	 */
	dispose(): void {
		if (this.node) {
			this.node.destroy();
			this.node = null;
		}
	}

	/**
	 * Collision hook
	 * @param other - The other game object
	 */
	onCollision?(other: GameObject): void;
}
