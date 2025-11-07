import Konva from 'konva';
import { Player } from '../objects/Player';
import { CollisionManager } from '../collision/CollisionManager';
import { Collidable } from '../collision/Collidable';
import { preloadImage } from '../utils/AssetLoader';
import { SpriteConfig } from '../movement/SpriteHelper';
import { PlayerConfig } from '../../configs/PlayerConfig';
import { MovementConfig } from '../../configs/MovementConfig';

/**
 * PlayerManagerOptions - Options for the PlayerManager
 * @param group - The group to add the player to
 * @param spriteConfig - The sprite configuration
 * @param x - The x position of the player
 * @param y - The y position of the player
 * @param scale - The scale of the player
 * @param walkSpeed - The walk speed of the player
 * @param runSpeed - The run speed of the player (deprecated, use movementConfig instead)
 * @param model - The model of the player
 * @param collisionManager - The collision manager
 * @param movementConfig - Optional movement configuration. If not provided, uses default PlayerConfig settings.
 */
export interface PlayerManagerOptions {
	group: Konva.Group;
	spriteConfig: SpriteConfig;
	x: number;
	y: number;
	scale?: number;
	walkSpeed: number;
	runSpeed?: number; // Deprecated: use movementConfig instead
	model?: { x: number; y: number };
	collisionManager?: CollisionManager | null;
	movementConfig?: MovementConfig;
}

/**
 * PlayerManager - Generic manager to load a player image/sprite, create a PlayerMovement,
 * and run a Konva.Animation updating the movement while started.
 * Screens can instantiate this with different groups and configuration.
 */
export class PlayerManager {
	private group: Konva.Group;
	private spriteConfig: SpriteConfig;
	private sprite: Konva.Sprite | null = null;
	private currentAnimation: string | null = null;
	private player: Player | null = null;
	private collisionManager?: CollisionManager | null;
	private x: number;
	private y: number;
	private scale: number;
	private externalModel?: { x: number; y: number } | undefined;
	private lastFacing: 'left' | 'right' = 'right';
	private movementConfig?: MovementConfig;

	constructor(opts: PlayerManagerOptions) {
		this.group = opts.group;
		this.spriteConfig = opts.spriteConfig;
		this.x = opts.x;
		this.y = opts.y;
		this.scale = typeof opts.scale === 'number' ? opts.scale : 1;
		this.externalModel = opts.model;
		this.collisionManager = opts.collisionManager ?? null;
		this.movementConfig = opts.movementConfig ?? {
			keys: {
				up: PlayerConfig.CONTROLS.MOVE_UP,
				down: PlayerConfig.CONTROLS.MOVE_DOWN,
				left: PlayerConfig.CONTROLS.MOVE_LEFT,
				right: PlayerConfig.CONTROLS.MOVE_RIGHT,
			},
			walkSpeed: opts.walkSpeed,
			runSpeed: opts.runSpeed,
			jumpKeys: PlayerConfig.CONTROLS.JUMP,
			enableJumping: true,
		};

		this.load();
	}

	/**
	 * Load the player sprite and create the player object
	 */
	private async load() {
		try {
			const x = this.externalModel?.x ?? this.x;
			const y = this.externalModel?.y ?? this.y;
			const image = await preloadImage(this.spriteConfig.imageUrl);
			const sprite = new Konva.Sprite({
				id: 'playerSprite',
				x,
				y,
				image,
				animation: this.spriteConfig.defaultAnimation,
				animations: this.spriteConfig.animations,
				frameRate: this.spriteConfig.frameRate || 8,
				frameIndex: 0,
				width: this.spriteConfig.frameWidth,
				height: this.spriteConfig.frameHeight,
			});
			const totalScale = this.scale * (this.spriteConfig.scale || 1);
			sprite.scale({ x: totalScale, y: totalScale });
			sprite.offset({
				x: this.spriteConfig.frameWidth / 2,
				y: this.spriteConfig.frameHeight / 2,
			});
			this.sprite = sprite;
			this.group.add(sprite);
			this.currentAnimation = this.spriteConfig.defaultAnimation;
			if (
				this.spriteConfig.animationFrameRates &&
				this.spriteConfig.animationFrameRates[this.spriteConfig.defaultAnimation] !== undefined
			) {
				sprite.frameRate(this.spriteConfig.animationFrameRates[this.spriteConfig.defaultAnimation]);
			} else {
				sprite.frameRate(this.spriteConfig.frameRate || 8);
			}
			const model = { x: sprite.x(), y: sprite.y() };
			const usedModel = this.externalModel ?? model;
			this.player = new Player('player', usedModel, this.movementConfig);
			this.player.attachNode(sprite);
			if (this.collisionManager && this.player.collidable) {
				this.collisionManager.register(this.player.collidable);
			}
			sprite.start();
			this.group.getLayer()?.batchDraw();
		} catch (e) {
			console.error('Failed to load sprite:', e);
		}
	}

	/**
	 * Get the movement state of the player
	 * @param velocity - The velocity of the player
	 * @param isJumping - Whether the player is jumping
	 * @param isRunning - Whether the player is running
	 * @returns The movement state and facing direction
	 */
	private getMovementState(
		velocity: { x: number; y: number },
		isJumping: boolean,
		isRunning: boolean
	): { state: string; facing: 'left' | 'right' } {
		if (isJumping) {
			const facing = velocity.x < 0 ? 'left' : velocity.x > 0 ? 'right' : this.lastFacing;
			this.lastFacing = facing;
			return { state: 'jump', facing };
		}
		const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
		const facing =
			speed < PlayerConfig.CALCULATIONS.MIN_VELOCITY_THRESHOLD
				? this.lastFacing
				: velocity.x < 0
					? 'left'
					: 'right';
		this.lastFacing = facing;
		if (speed < PlayerConfig.CALCULATIONS.MIN_VELOCITY_THRESHOLD) return { state: 'idle', facing };
		return { state: isRunning ? 'run' : 'walk', facing };
	}

	/**
	 * Update the player movement
	 * @param deltaTimeMs - The time since the last frame in milliseconds
	 */
	update(deltaTimeMs: number): void {
		if (!this.player || !this.player.movement) return;
		const vx = this.player.movement.getVelocityX();
		const vy = this.player.movement.getVelocityY();
		const isJumping = this.player.movement.isJumping();
		const hasInput = vx !== 0 || vy !== 0 || isJumping;
		this.player.update(deltaTimeMs);
		if (hasInput && this.collisionManager && this.player.collidable) {
			this.collisionManager.markMoved(this.player.collidable);
		}
		if (this.sprite && this.player.movement) {
			const velocity = {
				x: this.player.movement.getVelocityX(),
				y: this.player.movement.getVelocityY(),
			};
			const jumping = this.player.movement.isJumping();
			const running = this.player.movement.isRunning();
			const { state, facing } = this.getMovementState(velocity, jumping, running);
			const currentScale = Math.abs(this.sprite.scaleX());
			this.sprite.scaleX(currentScale * (facing === 'left' ? -1 : 1));
			if (this.currentAnimation !== state) {
				this.currentAnimation = state;
				this.sprite.animation(state);
				if (
					this.spriteConfig.animationFrameRates &&
					this.spriteConfig.animationFrameRates[state] !== undefined
				) {
					this.sprite.frameRate(this.spriteConfig.animationFrameRates[state]);
				} else {
					this.sprite.frameRate(this.spriteConfig.frameRate || 8);
				}
			}
		}
	}
	
	/**
	 * Dispose of the player manager
	 */
	dispose() {
		if (this.player) {
			if (this.collisionManager && this.player.collidable) {
				this.collisionManager.unregister(this.player.collidable);
			}
			this.player.dispose();
			this.player = null;
		}
		if (this.sprite) {
			this.sprite.stop();
			this.sprite.destroy();
			this.sprite = null;
		}
	}

	/**
	 * Get the node of the player
	 * @returns The node of the player
	 */
	getNode(): Konva.Node | null {
		return this.sprite;
	}

	/**
	 * Get the collidable of the player
	 * @returns The collidable of the player
	 */
	getPlayerCollidable(): Collidable | null {
		return this.player?.collidable ?? null;
	}
}
