import Konva from 'konva';
import { GameObject } from './GameObject';
import { PlayerMovement } from '../movement/PlayerMovement';
import { Collidable } from '../collision/Collidable';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { PlayerConfig } from '../../configs/PlayerConfig';
import { Movement } from '../movement/Movement';
import { MovementConfig } from '../../configs/MovementConfig';

export class Player extends GameObject {
	movement: Movement | null = null;
	collidable: Collidable | null = null;
	private halfWidth = 0;
	private halfHeight = 0;
	private movementConfig?: MovementConfig;

	/**
	 * Constructor for the Player
	 * @param id - The id of the player
	 * @param model - The model of the player
	 * @param movementConfig - Optional movement configuration. If not provided, uses default PlayerConfig settings.
	 */
	constructor(id: string, model: { x: number; y: number }, movementConfig?: MovementConfig) {
		super(id, model.x, model.y);
		this.model = model;
		this.movementConfig = movementConfig;
		this.collidable = new Collidable(this);
	}

	/**
	 * Attach a node to the player
	 * @param node - The node to attach
	 */
	attachNode(node: Konva.Node): void {
		super.attachNode(node);
		if (!this.movement) {
			// Use provided config or create default config from PlayerConfig
			const config = this.movementConfig ?? {
				keys: {
					up: PlayerConfig.CONTROLS.MOVE_UP,
					down: PlayerConfig.CONTROLS.MOVE_DOWN,
					left: PlayerConfig.CONTROLS.MOVE_LEFT,
					right: PlayerConfig.CONTROLS.MOVE_RIGHT,
				},
				walkSpeed: 150, // Default walk speed (should be specified per-player in practice)
				jumpKeys: PlayerConfig.CONTROLS.JUMP,
				enableJumping: true,
			};
			this.movement = new PlayerMovement(this.model, node, config);
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
