import Konva from 'konva';
import { Projectile } from '../objects/Projectile';
import { CollisionManager } from '../collision/CollisionManager';
import { Collidable } from '../collision/Collidable';
import { preloadImage } from '../utils/AssetLoader';
import { GameObject } from '../objects/GameObject';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';

export interface ProjectileManagerOptions {
	group: Konva.Group;
	collisionManager?: CollisionManager | null;
	imageUrl?: string;
	speed?: number;
	scale?: number;
	direction?: { x: number; y: number };
	bounds?: { width: number; height: number };
}

export interface ShootProjectileOptions {
	x: number;
	y: number;
	direction?: { x: number; y: number };
	speed?: number;
	onCollision?: (projectile: Projectile, other: GameObject) => void;
}

const DEFAULT_IMAGE_URL = '/assets/sprites/laser_shot_sprite.png';
const DEFAULT_SPEED = 1000;
const DEFAULT_SCALE = 0.3;
const DEFAULT_DIRECTION = { x: 0, y: -1 };
const DEFAULT_BOUNDS = { width: STAGE_WIDTH, height: STAGE_HEIGHT };

function normalizeDirection(direction: { x: number; y: number }): { x: number; y: number } {
	const magnitude = Math.hypot(direction.x, direction.y);
	if (magnitude === 0) return DEFAULT_DIRECTION;
	return { x: direction.x / magnitude, y: direction.y / magnitude };
}

/**
 * ProjectileManager - Manages generic projectiles (loading sprite, spawning, collision, cleanup)
 */
export class ProjectileManager {
	private projectiles: Projectile[] = [];
	private group: Konva.Group;
	private collisionManager?: CollisionManager | null;
	private projectileImage: HTMLImageElement | null = null;
	private defaultSpeed: number;
	private imageUrl: string;
	private isLoaded = false;
	private playerCollidable?: Collidable | null;
	private defaultScale: number;
	private defaultDirection: { x: number; y: number };
	private bounds: { width: number; height: number };

	constructor(options: ProjectileManagerOptions) {
		this.group = options.group;
		this.collisionManager = options.collisionManager ?? null;
		this.imageUrl = options.imageUrl ?? DEFAULT_IMAGE_URL;
		this.defaultSpeed = options.speed ?? DEFAULT_SPEED;
		this.defaultScale = options.scale ?? DEFAULT_SCALE;
		this.defaultDirection = normalizeDirection(options.direction ?? DEFAULT_DIRECTION);
		this.bounds = options.bounds ?? DEFAULT_BOUNDS;
		this.loadProjectileImage();
	}

	private async loadProjectileImage(): Promise<void> {
		try {
			this.projectileImage = await preloadImage(this.imageUrl);
			this.isLoaded = true;
		} catch (error) {
			console.error('Failed to load projectile image:', error);
		}
	}

	shoot(options: ShootProjectileOptions): void {
		if (!this.isLoaded || !this.projectileImage) {
			console.warn('Projectile image not loaded yet, skipping shot');
			return;
		}

		const projectileId = `projectile_${Date.now()}_${Math.random()}`;
		const direction = normalizeDirection(options.direction ?? this.defaultDirection);
		const speed = options.speed ?? this.defaultSpeed;

		const projectile = new Projectile(projectileId, options.x, options.y, {
			speed,
			direction,
			bounds: this.bounds,
		});

		const projectileNode = new Konva.Image({
			id: projectileId,
			image: this.projectileImage,
			x: options.x,
			y: options.y,
			width: this.projectileImage.width,
			height: this.projectileImage.height,
		});

		projectileNode.offset({
			x: this.projectileImage.width / 2,
			y: this.projectileImage.height / 2,
		});

		projectileNode.scale({ x: this.defaultScale, y: this.defaultScale });

		projectile.attachNode(projectileNode);
		this.group.add(projectileNode);

		if (this.collisionManager && projectile.collidable) {
			this.collisionManager.register(projectile.collidable);
		}

		this.projectiles.push(projectile);

		projectile.onCollision = (other) => {
			if (this.playerCollidable && other === this.playerCollidable.owner) {
				return;
			}
			if (options.onCollision) {
				options.onCollision(projectile, other);
			}
			projectile.destroy();
		};
	}

	update(deltaTimeMs: number): void {
		for (const projectile of this.projectiles) {
			projectile.update(deltaTimeMs);
			if (this.collisionManager && projectile.collidable && !projectile.isDestroyed()) {
				this.collisionManager.markMoved(projectile.collidable);
			}
		}

		const projectilesToRemove = this.projectiles.filter((projectile) => projectile.isDestroyed());
		for (const projectile of projectilesToRemove) {
			if (this.collisionManager && projectile.collidable) {
				this.collisionManager.unregister(projectile.collidable);
			}
			const index = this.projectiles.indexOf(projectile);
			if (index > -1) {
				this.projectiles.splice(index, 1);
			}
			projectile.dispose();
		}
	}

	getProjectiles(): Projectile[] {
		return this.projectiles.filter((projectile) => !projectile.isDestroyed());
	}

	setPlayerCollidable(playerCollidable: Collidable | null): void {
		this.playerCollidable = playerCollidable;
	}

	clear(): void {
		for (const projectile of this.projectiles) {
			if (this.collisionManager && projectile.collidable) {
				this.collisionManager.unregister(projectile.collidable);
			}
			projectile.dispose();
		}
		this.projectiles = [];
	}

	dispose(): void {
		this.clear();
		this.projectileImage = null;
		this.isLoaded = false;
	}
}
