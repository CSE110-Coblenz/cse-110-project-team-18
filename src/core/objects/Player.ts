import Konva from 'konva';
import { GameObject } from './GameObject';
import { PlayerMovement } from '../movement/PlayerMovement';
import { Collidable } from './Collidable';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { PlayerConfig } from '../../configs/PlayerConfig';

export class Player extends GameObject {
	movement: PlayerMovement | null = null;
	collidable: Collidable | null = null;
	private halfWidth = 0;
	private halfHeight = 0;
	private walkSpeed: number;
	private runSpeed?: number;

	/**
	 * Constructor for the Player
	 * @param id - The id of the player
	 * @param model - The model of the player
	 * @param walkSpeed - The walk speed of the player
	 * @param runSpeed - The run speed of the player
	 */
	constructor(
		id: string,
		model: { x: number; y: number },
		walkSpeed: number = PlayerConfig.MOVEMENT.WALK_SPEED,
		runSpeed?: number
	) {
		super(id, model.x, model.y);
		this.model = model;
		this.walkSpeed = walkSpeed;
		this.runSpeed = runSpeed;
		this.collidable = new Collidable(this);
	}

	/**
	 * Attach a node to the player
	 * @param node - The node to attach
	 */
	attachNode(node: Konva.Node): void {
		super.attachNode(node);
		if (!this.movement) {
			this.movement = new PlayerMovement(this.model, node, this.walkSpeed, this.runSpeed);
		}

		try {
			const image: any = node as any;
			const w = (image.width && image.width() * (image.scaleX ? image.scaleX() : 1)) || 0;
			const h = (image.height && image.height() * (image.scaleY ? image.scaleY() : 1)) || 0;
			// center-based
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
			// ignore
		}
	}

	/**
	 * Update the player
	 * @param deltaTimeMs - The time since the last frame in milliseconds
	 */
	update(deltaTimeMs: number): void {
		if (this.movement) this.movement.update(deltaTimeMs);
		// sync node to model
		// enforce stage bounds so player cannot exit the visible area
		const minX = this.halfWidth;
		const maxX = STAGE_WIDTH - this.halfWidth;
		const minY = this.halfHeight;
		const maxY = STAGE_HEIGHT - this.halfHeight;
		if (this.model.x < minX) this.model.x = minX;
		if (this.model.x > maxX) this.model.x = maxX;
		if (this.model.y < minY) this.model.y = minY;
		if (this.model.y > maxY) this.model.y = maxY;

		if (this.node) {
			this.node.x(this.model.x);
			this.node.y(this.model.y);
		}
		// keep collidable in sync if rectangle
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
	 * Dispose of the player
	 */
	dispose(): void {
		this.movement?.dispose();
		this.movement = null;
		this.collidable = null;
		super.dispose();
	}
}
