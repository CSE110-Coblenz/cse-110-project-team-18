import Konva from 'konva';
import { Player } from '../objects/Player';
import { CollisionManager } from '../collision/CollisionManager';
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

	/**
	 * Constructor for the PlayerManager
	 * @param opts - The options for the PlayerManager
	 */
	constructor(opts: PlayerManagerOptions) {
		this.group = opts.group;
		this.spriteConfig = opts.spriteConfig;
		this.x = opts.x;
		this.y = opts.y;
		this.scale = typeof opts.scale === 'number' ? opts.scale : 1; // Default scale is 1
		this.externalModel = opts.model;
		this.collisionManager = opts.collisionManager ?? null;
		// Use provided movementConfig or create default from walkSpeed/runSpeed for backwards compatibility
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
	 * Load the player's sprite and create the player
	 */
	private async load() {
		try {
			// Use provided position (model takes precedence if provided, otherwise use x/y)
			const x = this.externalModel?.x ?? this.x;
			const y = this.externalModel?.y ?? this.y;

			// Load the image
			const image = await preloadImage(this.spriteConfig.imageUrl);

			// Create sprite
			const sprite = new Konva.Sprite({
				id: 'playerSprite',
				x,
				y,
				image,
				animation: this.spriteConfig.defaultAnimation,
				animations: this.spriteConfig.animations,
				frameRate: this.spriteConfig.frameRate || 8, // Default frame rate is 8
				frameIndex: 0,
				width: this.spriteConfig.frameWidth,
				height: this.spriteConfig.frameHeight,
			});

			// Apply scale
			const totalScale = this.scale * (this.spriteConfig.scale || 1);
			sprite.scale({ x: totalScale, y: totalScale });

			// Center the sprite on its position
			sprite.offset({
				x: this.spriteConfig.frameWidth / 2,
				y: this.spriteConfig.frameHeight / 2,
			});

			// Add to scene
			this.sprite = sprite;
			this.group.add(sprite);
			this.currentAnimation = this.spriteConfig.defaultAnimation;

			// Set initial frame rate based on default animation
			if (
				this.spriteConfig.animationFrameRates &&
				this.spriteConfig.animationFrameRates[this.spriteConfig.defaultAnimation] !== undefined
			) {
				sprite.frameRate(this.spriteConfig.animationFrameRates[this.spriteConfig.defaultAnimation]);
			} else {
				sprite.frameRate(this.spriteConfig.frameRate || 8); // Default frame rate is 8
			}

			// Create player model
			const model = { x: sprite.x(), y: sprite.y() };
			const usedModel = this.externalModel ?? model;
			this.player = new Player('player', usedModel, this.movementConfig);
			this.player.attachNode(sprite);

			if (this.collisionManager && this.player.collidable) {
				this.collisionManager.register(this.player.collidable);
			}

			// Start animation
			sprite.start();

			// Force immediate draw
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
	 * @returns The movement state of the player
	 */
	private getMovementState(
		velocity: { x: number; y: number },
		isJumping: boolean,
		isRunning: boolean
	): { state: string; facing: 'left' | 'right' } {
		// Prioritize jump animation if space bar is pressed
		if (isJumping) {
			const facing = velocity.x < 0 ? 'left' : velocity.x > 0 ? 'right' : this.lastFacing;
			this.lastFacing = facing;
			return { state: 'jump', facing };
		}

		const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
		// Keep last facing direction if not moving
		const facing =
			speed < PlayerConfig.CALCULATIONS.MIN_VELOCITY_THRESHOLD
				? this.lastFacing
				: velocity.x < 0
					? 'left'
					: 'right';
		this.lastFacing = facing;

		// If not moving, use idle animation
		if (speed < PlayerConfig.CALCULATIONS.MIN_VELOCITY_THRESHOLD) return { state: 'idle', facing };

		// If moving, use run or walk animation based on shift key
		return { state: isRunning ? 'run' : 'walk', facing };
	}

	/**
	 * Update must be called by the central game loop (App) or the owning controller.
	 * deltaTimeMs is milliseconds since last frame.
	 * @param deltaTimeMs - The time since the last frame in milliseconds
	 */
	update(deltaTimeMs: number): void {
		if (!this.player || !this.player.movement) return;

		// Check if player is trying to move (has input) before updating
		const vx = this.player.movement.getVelocityX();
		const vy = this.player.movement.getVelocityY();
		const isJumping = this.player.movement.isJumping();
		const hasInput = vx !== 0 || vy !== 0 || isJumping;

		// update player (movement + node sync)
		this.player.update(deltaTimeMs);

		// Mark as moved if player has any input (trying to move)
		// This handles cases where player is stuck but still pressing keys
		if (hasInput && this.collisionManager && this.player.collidable) {
			this.collisionManager.markMoved(this.player.collidable);
		}

		// update sprite animation
		if (this.sprite && this.player.movement) {
			const velocity = {
				x: this.player.movement.getVelocityX(),
				y: this.player.movement.getVelocityY(),
			};
			const isJumping = this.player.movement.isJumping();
			const isRunning = this.player.movement.isRunning();
			const { state, facing } = this.getMovementState(velocity, isJumping, isRunning);

			// flip sprite based on facing (preserve absolute scale)
			const currentScale = Math.abs(this.sprite.scaleX());
			this.sprite.scaleX(currentScale * (facing === 'left' ? -1 : 1));

			// switch animations if needed
			if (this.currentAnimation !== state) {
				this.currentAnimation = state;
				this.sprite.animation(state);

				// Update frame rate if this animation has a specific frame rate
				if (
					this.spriteConfig.animationFrameRates &&
					this.spriteConfig.animationFrameRates[state] !== undefined
				) {
					this.sprite.frameRate(this.spriteConfig.animationFrameRates[state]);
				} else {
					// Use default frame rate
					this.sprite.frameRate(this.spriteConfig.frameRate || 8);
				}
			}
		}
	}

	/**
	 * Dispose of the player and sprite
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
	 * Get the sprite node
	 * @returns The sprite node
	 */
	getNode(): Konva.Node | null {
		return this.sprite;
	}
}