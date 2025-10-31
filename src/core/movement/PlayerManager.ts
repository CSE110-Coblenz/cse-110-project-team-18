import Konva from 'konva';
import { Player } from '../objects/Player';
import { CollisionManager } from '../collision/CollisionManager';
import { preloadImage } from '../utils/AssetLoader';
import { SpriteConfig } from '../movement/SpriteHelper';
import { STAGE_WIDTH } from '../../constants';
import { PlayerConfig } from '../config/PlayerConfig';

export interface PlayerManagerOptions {
	group: Konva.Group;
	imageUrl?: string;
	spriteConfig?: SpriteConfig;
	x?: number;
	y?: number;
	scale?: number; // uniform scale
	walkSpeed?: number; // walk speed in pixels per second
	runSpeed?: number; // run speed in pixels per second
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
	private imageUrl?: string;
	private spriteConfig?: SpriteConfig;
	private node: Konva.Image | null = null;
	private sprite: Konva.Sprite | null = null;
	private currentAnimation: string | null = null;

	private player: Player | null = null;
	private collisionManager?: CollisionManager | null;
	private x: number | undefined;
	private y: number | undefined;
	private scale: number;
	private walkSpeed: number;
	private runSpeed?: number;
	private externalModel?: { x: number; y: number } | undefined;
	private lastFacing: 'left' | 'right' = 'right';

	constructor(opts: PlayerManagerOptions) {
		this.group = opts.group;
		this.imageUrl = opts.imageUrl;
		this.spriteConfig = opts.spriteConfig;
		this.x = opts.x;
		this.y = opts.y;
		this.scale = typeof opts.scale === 'number' ? opts.scale : PlayerConfig.MANAGER.DEFAULT_SCALE;
		this.walkSpeed = typeof opts.walkSpeed === 'number' ? opts.walkSpeed : PlayerConfig.MOVEMENT.WALK_SPEED;
		this.runSpeed = opts.runSpeed;
		this.externalModel = opts.model;
		this.collisionManager = opts.collisionManager ?? null;

		this.load();
	}

	private async load() {
		if (this.spriteConfig) {
			try {
				// Calculate initial position
				const x = this.externalModel?.x ?? (typeof this.x === 'number' ? this.x : STAGE_WIDTH / 2);
				const y = this.externalModel?.y ?? (typeof this.y === 'number' ? this.y : PlayerConfig.MANAGER.DEFAULT_Y_POSITION);

				console.log('[PlayerManager] Loading sprite:', {
					url: this.spriteConfig.imageUrl,
					position: { x, y },
					config: this.spriteConfig
				});

				// Load the image
				const image = await preloadImage(this.spriteConfig.imageUrl);
				console.log('[PlayerManager] Image loaded:', {
					width: image.width,
					height: image.height,
					complete: image.complete
				});

				// Create sprite
				const sprite = new Konva.Sprite({
					id: 'playerSprite',
					x,
					y,
					image,
					animation: this.spriteConfig.defaultAnimation,
					animations: this.spriteConfig.animations,
					frameRate: this.spriteConfig.frameRate || PlayerConfig.MANAGER.DEFAULT_FRAME_RATE,
					frameIndex: 0,
					width: this.spriteConfig.frameWidth,
					height: this.spriteConfig.frameHeight
				});

				// Apply scale
				const totalScale = this.scale * (this.spriteConfig.scale || 1);
				sprite.scale({ x: totalScale, y: totalScale });

				// Center the sprite on its position
				sprite.offset({
					x: this.spriteConfig.frameWidth / 2,
					y: this.spriteConfig.frameHeight / 2
				});

				// Add to scene
				this.sprite = sprite;
				this.group.add(sprite);
				this.currentAnimation = this.spriteConfig.defaultAnimation;

				// Set initial frame rate based on default animation
				if (this.spriteConfig.animationFrameRates && this.spriteConfig.animationFrameRates[this.spriteConfig.defaultAnimation] !== undefined) {
					sprite.frameRate(this.spriteConfig.animationFrameRates[this.spriteConfig.defaultAnimation]);
				} else {
					sprite.frameRate(this.spriteConfig.frameRate || PlayerConfig.MANAGER.DEFAULT_FRAME_RATE);
				}

				// Create player model
				const model = { x: sprite.x(), y: sprite.y() };
				const usedModel = this.externalModel ?? model;
				this.player = new Player('player', usedModel, this.walkSpeed, this.runSpeed);
				this.player.attachNode(sprite);

				if (this.collisionManager && this.player.collidable) {
					this.collisionManager.register(this.player.collidable);
				}

				// Start animation
				sprite.start();

				console.log('[PlayerManager] Sprite setup complete:', {
					position: { x: sprite.x(), y: sprite.y() },
					scale: sprite.scale(),
					offset: sprite.offset(),
					size: { w: sprite.width(), h: sprite.height() }
				});

				// Force immediate draw
				this.group.getLayer()?.batchDraw();
			} catch (e) {
				console.error('Failed to load sprite:', e);
			}
			return;
		}

		// Fall back to static image if no sprite config
		if (!this.imageUrl) return;

		Konva.Image.fromURL(this.imageUrl, (image) => {
			if (this.externalModel) {
				image.x(this.externalModel.x);
				image.y(this.externalModel.y);
			} else {
				if (typeof this.x === 'number') image.x(this.x);
				if (typeof this.y === 'number') image.y(this.y);
			}

			image.offsetX(image.width() / 2);
			image.offsetY(image.height() / 2);
			image.scaleX(this.scale);
			image.scaleY(this.scale);

			this.node = image;
			this.group.add(this.node);

			const model = { x: image.x(), y: image.y() };
			const usedModel = this.externalModel ?? model;
			this.player = new Player('player', usedModel, this.walkSpeed, this.runSpeed);
			this.player.attachNode(this.node);

			if (this.collisionManager && this.player.collidable) {
				this.collisionManager.register(this.player.collidable);
			}
		});
	}

	private getMovementState(velocity: { x: number, y: number }, isJumping: boolean, isRunning: boolean): { state: string; facing: 'left' | 'right' } {
		// Prioritize jump animation if space bar is pressed
		if (isJumping) {
			const facing = velocity.x < 0 ? 'left' : (velocity.x > 0 ? 'right' : this.lastFacing);
			this.lastFacing = facing;
			return { state: 'jump', facing };
		}
		
		const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
		// Keep last facing direction if not moving
		const facing = speed < PlayerConfig.CALCULATIONS.MIN_VELOCITY_THRESHOLD ? this.lastFacing : (velocity.x < 0 ? 'left' : 'right');
		this.lastFacing = facing;
		
		// If not moving, use idle animation
		if (speed < PlayerConfig.CALCULATIONS.MIN_VELOCITY_THRESHOLD) return { state: 'idle', facing };
		
		// If moving, use run or walk animation based on shift key
		return { state: isRunning ? 'run' : 'walk', facing };
	}

	/**
	 * Update must be called by the central game loop (App) or the owning controller.
	 * deltaTimeMs is milliseconds since last frame.
	 */
	update(deltaTimeMs: number): void {
		if (!this.player || !this.player.movement) return;

		// update player (movement + node sync)
		this.player.update(deltaTimeMs);

		// update sprite animation if using spriteConfig
		if (this.sprite && this.spriteConfig && this.player.movement) {
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
				if (this.spriteConfig.animationFrameRates && this.spriteConfig.animationFrameRates[state] !== undefined) {
					this.sprite.frameRate(this.spriteConfig.animationFrameRates[state]);
				} else {
					// Use default frame rate
					this.sprite.frameRate(this.spriteConfig.frameRate || 8);
				}
			}
		}
	}

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
		if (this.node) {
			this.node.destroy();
			this.node = null;
		}
	}

	getNode(): Konva.Node | null {
		return this.sprite || this.node;
	}
}