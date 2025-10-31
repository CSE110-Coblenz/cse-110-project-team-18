import { Vector2d } from 'konva/lib/types';

export interface SpriteConfig {
	/**
	 * Path to the spritesheet image (relative to public/)
	 */
	imageUrl: string;
	/**
	 * Map of animation names to arrays of frame data
	 * Each animation is an array: [x, y, width, height, x, y, width, height, ...]
	 * Where each frame is defined by 4 consecutive numbers: x position, y position, frame width, frame height
	 */
	animations: Record<string, number[]>;
	/**
	 * Default animation to play
	 */
	defaultAnimation: string;
	/**
	 * Frames per second for animations (default for all animations)
	 */
	frameRate?: number;
	/**
	 * Optional: Per-animation frame rates (overrides default frameRate for specific animations)
	 */
	animationFrameRates?: Record<string, number>;
	/**
	 * Scale to apply to the sprite
	 */
	scale?: number;
	/**
	 * Width of each frame in the spritesheet
	 */
	frameWidth: number;
	/**
	 * Height of each frame in the spritesheet
	 */
	frameHeight: number;
}

/**
 * Get movement state and facing direction from a velocity vector
 */
export function getMovementState(velocity: Vector2d): { state: string; facing: 'left' | 'right' } {
	const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
	const facing = velocity.x < 0 ? 'left' : 'right';

	if (speed < 0.1) return { state: 'idle', facing };
	if (speed < 200) return { state: 'walk', facing };
	return { state: 'run', facing };
}
