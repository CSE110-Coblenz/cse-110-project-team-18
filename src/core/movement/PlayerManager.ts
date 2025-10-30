import Konva from 'konva';
import { Player } from '../objects/Player';
import { CollisionManager } from '../collision/CollisionManager';

export interface PlayerManagerOptions {
	group: Konva.Group;
	imageUrl: string;
	x?: number;
	y?: number;
	scale?: number; // uniform scale
	speed?: number; // pixels per second
	model?: { x: number; y: number };
	collisionManager?: CollisionManager | null;
}

/**
 * PlayerManager
 * Generic manager to load a player image/sprite, create a PlayerMovement,
 * and run a Konva.Animation updating the movement while started.
 *
 * Screens can instantiate this with different groups and configuration.
 */
export class PlayerManager {
	private group: Konva.Group;
	private imageUrl: string;
	private node: Konva.Image | null = null;

	private player: Player | null = null;
	private collisionManager?: CollisionManager | null;
	private x: number | undefined;
	private y: number | undefined;
	private scale: number;
	private speed: number;
	private externalModel?: { x: number; y: number } | undefined;

	constructor(opts: PlayerManagerOptions) {
		this.group = opts.group;
		this.imageUrl = opts.imageUrl;
		this.x = opts.x;
		this.y = opts.y;
		this.scale = typeof opts.scale === 'number' ? opts.scale : 1;
		this.speed = typeof opts.speed === 'number' ? opts.speed : 150;
		this.externalModel = opts.model;
		this.collisionManager = opts.collisionManager ?? null;

		this.load();
	}

	private load() {
		Konva.Image.fromURL(this.imageUrl, (image) => {
			// if an external model was provided, initialize the node at the model's position
			if (this.externalModel) {
				image.x(this.externalModel.x);
				image.y(this.externalModel.y);
			} else {
				// otherwise fall back to optional x/y from options
				if (typeof this.x === 'number') image.x(this.x);
				if (typeof this.y === 'number') image.y(this.y);
			}

			image.offsetX(image.width() / 2);
			image.offsetY(image.height() / 2);
			image.scaleX(this.scale);
			image.scaleY(this.scale);

			this.node = image;
			this.group.add(this.node);

			// create or reuse a model and a Player object that composes movement + collidable
			const model = { x: image.x(), y: image.y() };
			const usedModel = this.externalModel ?? model;
			this.player = new Player('player', usedModel, this.speed);
			this.player.attachNode(this.node);

			// register collidable if a collision manager was provided
			if (this.collisionManager && this.player.collidable) {
				this.collisionManager.register(this.player.collidable);
			}
		});
	}

	/**
	 * Update must be called by the central game loop (App) or the owning controller.
	 * deltaTimeMs is milliseconds since last frame.
	 */
	update(deltaTimeMs: number): void {
		if (!this.player) return;

		// update player (movement + node sync)
		this.player.update(deltaTimeMs);
	}

	dispose() {
		if (this.player) {
			// unregister collidable
			if (this.collisionManager && this.player.collidable) {
				this.collisionManager.unregister(this.player.collidable);
			}
			this.player.dispose();
			this.player = null;
		}
		if (this.node) {
			this.node.destroy();
			this.node = null;
		}
	}

	// Optional helper to get the underlying node
	getNode(): Konva.Image | null {
		return this.node;
	}
}
