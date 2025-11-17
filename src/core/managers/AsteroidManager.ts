import Konva from 'konva';
import { Projectile } from '../objects/Projectile';
import { CollisionManager } from '../collision/CollisionManager';
import { preloadImage } from '../utils/AssetLoader';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { asteroidSpriteConfig } from '../sprites/AsteroidSprite';

/**
 * AsteroidManagerOptions - Options for the asteroid manager
 * @param group - The group to add asteroids to
 * @param collisionManager - The collision manager to use
 * @param speed - The speed of asteroids (pixels per second)
 * @param scale - The scale of asteroids
 * @param spawnIntervalMs - The interval between asteroid spawns in milliseconds
 */
export interface AsteroidManagerOptions {
	group: Konva.Group;
	collisionManager?: CollisionManager | null;
	speed?: number;
	scale?: number;
	spawnIntervalMs?: number;
	targetNumber: number;
	maxValue?: number;
	onAsteroidHit?: (isFactor: boolean) => void;
	onAsteroidReachedBottom?: (isFactor: boolean) => void;
}

const DEFAULT_SPEED = 200; // pixels per second
const DEFAULT_SCALE = 0.7;
const DEFAULT_SPAWN_INTERVAL_MS = 2000; // 2 seconds
const DEFAULT_MAX_VALUE = 50;
const FACTOR_FONT_SIZE = 36;
const FACTOR_FONT_COLOR = '#FFFFFF';
const FACTOR_FONT_STROKE = '#000000';
const FACTOR_FONT_STROKE_WIDTH = 2;

function randomInt(min: number, max: number): number {
	const lower = Math.ceil(min);
	const upper = Math.floor(max);
	return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

/**
 * AsteroidManager - Manages asteroid spawning and movement
 */
interface AsteroidData {
	projectile: Projectile;
	label: Konva.Text;
	value: number;
	isCorrect: boolean;
	radius: number;
	flashUntil?: number;
}

export class AsteroidManager {
	private asteroids: AsteroidData[] = [];
	private group: Konva.Group;
	private collisionManager?: CollisionManager | null;
	private asteroidImage: HTMLImageElement | null = null;
	private speed: number;
	private isLoaded = false;
	private scale: number;
	private spawnIntervalMs: number;
	private timeSinceLastSpawn = 0;
	private frameWidth = 0;
	private frameHeight = 0;
	private readonly frameCount = 5;
	private elapsedTime = 0;
	private targetNumber: number;
	private maxValue: number;
	private onAsteroidHit?: (isFactor: boolean) => void;
	private onAsteroidReachedBottom?: (isFactor: boolean) => void;
	private factorCount = 0; // Track how many factors we've spawned
	private totalSpawned = 0; // Track total asteroids spawned

	constructor(options: AsteroidManagerOptions) {
		this.group = options.group;
		this.collisionManager = options.collisionManager ?? null;
		this.speed = options.speed ?? DEFAULT_SPEED;
		this.scale = options.scale ?? DEFAULT_SCALE;
		this.spawnIntervalMs = options.spawnIntervalMs ?? DEFAULT_SPAWN_INTERVAL_MS;
		this.targetNumber = options.targetNumber;
		this.maxValue = options.maxValue ?? DEFAULT_MAX_VALUE;
		this.onAsteroidHit = options.onAsteroidHit;
		this.onAsteroidReachedBottom = options.onAsteroidReachedBottom;
		this.loadAsteroidImage();
	}

	private getCorrectValues(): number[] {
		const correctValues: number[] = [];
		if (this.targetNumber === 0) return correctValues;
		for (let i = 1; i <= this.maxValue; i++) {
			// Include both factors (targetNumber % i === 0) and multiples (i % targetNumber === 0)
			if (this.targetNumber % i === 0 || i % this.targetNumber === 0) {
				correctValues.push(i);
			}
		}
		return correctValues;
	}

	private generateAsteroidValue(): number {
		// Make 1/3 correct (factors or multiples), 2/3 purely random (could be correct or incorrect)
		// We want exactly 1/3 to be guaranteed correct values
		const shouldBeCorrect = this.totalSpawned % 3 === 0;

		if (shouldBeCorrect) {
			const correctValues = this.getCorrectValues();
			if (correctValues.length > 0) {
				return correctValues[Math.floor(Math.random() * correctValues.length)];
			}
		}

		// Generate purely random value (1 to maxValue, regardless of correctness)
		return randomInt(1, this.maxValue);
	}

	private isCorrectValue(value: number): boolean {
		if (this.targetNumber === 0) return false;
		// Check if value is a factor of targetNumber (targetNumber % value === 0)
		// OR if value is a multiple of targetNumber (value % targetNumber === 0)
		return this.targetNumber % value === 0 || value % this.targetNumber === 0;
	}

	private createNumberLabel(value: number, x: number, y: number): Konva.Text {
		const label = new Konva.Text({
			text: value.toString(),
			x,
			y,
			fontSize: FACTOR_FONT_SIZE,
			fontStyle: 'bold',
			fill: FACTOR_FONT_COLOR,
			stroke: FACTOR_FONT_STROKE,
			strokeWidth: FACTOR_FONT_STROKE_WIDTH,
			align: 'center',
		});

		return label;
	}

	/**
	 * Load the asteroid sprite sheet image
	 */
	private async loadAsteroidImage(): Promise<void> {
		try {
			this.asteroidImage = await preloadImage(asteroidSpriteConfig.imageUrl);
			// Calculate frame dimensions based on actual image size
			if (this.asteroidImage) {
				// Sprite sheet contains multiple asteroid frames in a single row
				this.frameWidth = Math.floor(this.asteroidImage.width / this.frameCount);
				this.frameHeight = this.asteroidImage.height;
				console.log('Asteroid sprite sheet loaded:', {
					width: this.asteroidImage.width,
					height: this.asteroidImage.height,
					frameWidth: this.frameWidth,
					frameHeight: this.frameHeight,
				});
			}
			this.isLoaded = true;
		} catch (error) {
			console.error('Failed to load asteroid image:', error);
		}
	}

	/**
	 * Spawn a new asteroid at a random x position at the top of the screen
	 */
	spawnAsteroid(): void {
		if (!this.isLoaded || !this.asteroidImage) {
			console.warn('Asteroid image not loaded yet, skipping spawn');
			return;
		}

		// Random x position within screen bounds
		const frameWidth = this.frameWidth;
		const frameHeight = this.frameHeight;
		const randomFrameIndex = Math.floor(Math.random() * this.frameCount);
		const frameX = randomFrameIndex * frameWidth;
		const frameY = 0;
		const scaledWidth = frameWidth * this.scale;
		const scaledHeight = frameHeight * this.scale;

		// Calculate center position for the asteroid
		const centerX = Math.random() * (STAGE_WIDTH - scaledWidth) + scaledWidth / 2;
		const centerY = scaledHeight / 2; // Start at top with center at half height

		// Create asteroid as a projectile moving downward (model position is at center)
		const asteroidId = `asteroid_${Date.now()}_${Math.random()}`;
		const asteroid = new Projectile(asteroidId, centerX, centerY, {
			speed: this.speed,
			direction: { x: 0, y: 1 }, // Move downward
			bounds: { width: STAGE_WIDTH, height: STAGE_HEIGHT },
		});

		this.totalSpawned++;
		const asteroidValue = this.generateAsteroidValue();
		const isCorrect = this.isCorrectValue(asteroidValue);
		if (isCorrect) {
			this.factorCount++;
		}

		// Create Konva image and crop to the selected frame
		// Position node at top-left, then offset to center it
		const asteroidNode = new Konva.Image({
			id: asteroidId,
			image: this.asteroidImage,
			x: centerX,
			y: centerY,
			width: frameWidth,
			height: frameHeight,
		});

		asteroidNode.crop({
			x: frameX,
			y: frameY,
			width: frameWidth,
			height: frameHeight,
		});

		// Center the node by setting offset (this makes x,y represent the center)
		asteroidNode.offset({
			x: frameWidth / 2,
			y: frameHeight / 2,
		});

		// Apply scale before attaching node so collision detection accounts for it
		asteroidNode.scale({ x: this.scale, y: this.scale });

		// Attach node first so collision bounds are calculated with scale
		asteroid.attachNode(asteroidNode);

		// Set collision boundary as a circle with radius = frame width / 2 (scaled)
		const scaledFrameWidth = frameWidth * this.scale;
		const radius = scaledFrameWidth / 2;
		if (asteroid.collidable) {
			asteroid.collidable.setCircle(asteroid.model.x, asteroid.model.y, radius);
		}

		// Create text label for the asteroid's numeric value
		const numberLabel = this.createNumberLabel(asteroidValue, asteroid.model.x, asteroid.model.y);

		this.group.add(asteroidNode);
		this.group.add(numberLabel);
		numberLabel.offset({
			x: numberLabel.width() / 2,
			y: numberLabel.height() / 2,
		});
		numberLabel.scale({ x: 1, y: 1 });
		numberLabel.fill(FACTOR_FONT_COLOR);
		numberLabel.stroke(FACTOR_FONT_STROKE);
		numberLabel.moveToTop();
		// this.group.add(collisionEllipse);

		const asteroidData: AsteroidData = {
			projectile: asteroid,
			label: numberLabel,
			value: asteroidValue,
			isCorrect,
			radius,
		};

		this.asteroids.push(asteroidData);

		// Register with collision manager
		if (this.collisionManager && asteroid.collidable) {
			this.collisionManager.register(asteroid.collidable);
		}

		// Set up collision handler to destroy both asteroid and laser on collision
		asteroid.onCollision = (other) => {
			if (other instanceof Projectile && other.id.startsWith('projectile_')) {
				this.handleAsteroidHit(asteroidData, other);
			}
		};
		console.log('Asteroid spawned:', {
			id: asteroidId,
			x: centerX,
			y: centerY,
			frameIndex: randomFrameIndex,
			frameX,
			frameY,
			frameWidth,
			frameHeight,
			value: asteroidValue,
			isCorrect,
		});
	}

	private handleAsteroidHit(asteroidData: AsteroidData, other: Projectile): void {
		if (asteroidData.flashUntil !== undefined) return;

		const { projectile, isCorrect } = asteroidData;

		// Notify controller about the hit
		if (this.onAsteroidHit) {
			this.onAsteroidHit(isCorrect);
		}

		asteroidData.flashUntil = this.elapsedTime + 250;

		projectile.destroy();
		other.destroy();
	}

	/**
	 * Update the asteroid manager
	 * @param deltaTimeMs - The time since the last frame in milliseconds
	 */
	update(deltaTimeMs: number): void {
		this.elapsedTime += deltaTimeMs;

		// Spawn new asteroids periodically
		this.timeSinceLastSpawn += deltaTimeMs;
		if (this.timeSinceLastSpawn >= this.spawnIntervalMs) {
			this.spawnAsteroid();
			this.timeSinceLastSpawn = 0;
		}

		// Update all asteroids
		for (const asteroidData of this.asteroids) {
			const asteroid = asteroidData.projectile;
			const wasDestroyed = asteroid.isDestroyed();
			asteroid.update(deltaTimeMs);

			// Check if asteroid reached bottom (destroyed by going out of bounds)
			if (!wasDestroyed && asteroid.isDestroyed() && asteroidData.flashUntil === undefined) {
				// Asteroid reached bottom without being hit
				if (this.onAsteroidReachedBottom) {
					this.onAsteroidReachedBottom(asteroidData.isCorrect);
				}
			}

			// Update collision circle position
			if (asteroid.collidable && asteroid.collidable.shape) {
				const shape = asteroid.collidable.shape as any;
				if (shape.r !== undefined) {
					// Update circle position
					shape.x = asteroid.model.x;
					shape.y = asteroid.model.y;
				}
			}

			if (this.collisionManager && asteroid.collidable && !asteroid.isDestroyed()) {
				this.collisionManager.markMoved(asteroid.collidable);
			}

			// Keep label centered with asteroid
			asteroidData.label.x(asteroid.model.x);
			asteroidData.label.y(asteroid.model.y);
			asteroidData.label.moveToTop();
		}

		// Remove destroyed asteroids
		const asteroidsToRemove = this.asteroids.filter(
			(asteroidData) =>
				asteroidData.projectile.isDestroyed() &&
				(asteroidData.flashUntil === undefined || this.elapsedTime >= asteroidData.flashUntil)
		);
		for (const asteroidData of asteroidsToRemove) {
			const asteroid = asteroidData.projectile;
			if (this.collisionManager && asteroid.collidable) {
				this.collisionManager.unregister(asteroid.collidable);
			}
			// Dispose of the collision ellipse
			const index = this.asteroids.indexOf(asteroidData);
			if (index > -1) {
				this.asteroids.splice(index, 1);
			}
			asteroidData.label.destroy();
			asteroid.dispose();
		}
	}

	/**
	 * Get all active asteroids
	 * @returns Array of active asteroids
	 */
	getAsteroids(): Projectile[] {
		return this.asteroids
			.filter((asteroidData) => !asteroidData.projectile.isDestroyed())
			.map((asteroidData) => asteroidData.projectile);
	}

	/**
	 * Clear all asteroids
	 */
	clear(): void {
		for (const asteroidData of this.asteroids) {
			const asteroid = asteroidData.projectile;
			if (this.collisionManager && asteroid.collidable) {
				this.collisionManager.unregister(asteroid.collidable);
			}
			asteroidData.label.destroy();
			asteroid.dispose();
		}
		this.asteroids = [];
		this.timeSinceLastSpawn = 0;
		this.elapsedTime = 0;
		this.factorCount = 0;
		this.totalSpawned = 0;
	}

	/**
	 * Dispose of the asteroid manager
	 */
	dispose(): void {
		this.clear();
		this.asteroidImage = null;
		this.isLoaded = false;
	}
}
