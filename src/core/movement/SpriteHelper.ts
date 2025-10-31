import { Vector2d } from 'konva/lib/types';

/**
 * SpriteConfig - Configuration for a sprite
 * @param imageUrl - The URL of the image for the sprite
 * @param animations - The animations for the sprite
 * @param defaultAnimation - The default animation for the sprite
 * @param frameRate - The frame rate for the sprite
 * @param animationFrameRates - The frame rates for the animations
 * @param scale - The scale for the sprite
 * @param frameWidth - The width of the frame for the sprite
 * @param frameHeight - The height of the frame for the sprite
 */
export interface SpriteConfig {
	imageUrl: string;
	animations: Record<string, number[]>; // Map of animation names to arrays of frame data (x, y, width, height)
	defaultAnimation: string;
	frameRate?: number;
	animationFrameRates?: Record<string, number>; // Optional: Per-animation frame rates (overrides default frameRate for specific animations)
	scale?: number;
	frameWidth: number;
	frameHeight: number;
}

/**
 * Get movement state and facing direction from a velocity vector
 * @param velocity - The velocity vector
 * @returns The movement state and facing direction
 */
export function getMovementState(velocity: Vector2d): { state: string; facing: 'left' | 'right' } {
	const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
	const facing = velocity.x < 0 ? 'left' : 'right';

	if (speed < 0.1) return { state: 'idle', facing };
	if (speed < 200) return { state: 'walk', facing };
	return { state: 'run', facing };
}
