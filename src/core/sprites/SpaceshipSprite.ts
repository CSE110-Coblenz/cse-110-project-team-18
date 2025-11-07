import { SpriteConfig } from '../movement/SpriteHelper';

const frameWidth = 968;
const frameHeight = 765;

// Create a single static animation frame (the whole image)
// Format: [x, y, width, height]
const staticFrame = [0, 0, frameWidth, frameHeight];

export const spaceshipSprite: SpriteConfig = {
	imageUrl: '/assets/sprites/spaceship_sprite.png',
	animations: {
		// Single static frame for all animations (no animation needed for static sprite)
		idle: staticFrame,
		walk: staticFrame,
		run: staticFrame,
	},
	defaultAnimation: 'idle',
	frameRate: 1, // Static, no animation needed
	scale: 0.15,
	frameWidth: frameWidth,
	frameHeight: frameHeight,
};