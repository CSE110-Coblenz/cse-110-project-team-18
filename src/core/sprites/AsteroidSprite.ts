import { SpriteConfig } from '../movement/SpriteHelper';

/**
 * Asteroid sprite sheet configuration
 * Based on the sprite sheet having 8 asteroids arranged horizontally
 * Each frame is defined as [x, y, width, height]
 */
const ASTEROID_COUNT = 5;
const FRAME_HEIGHT = 100; // Based on the sprite sheet dimensions

// Since we don't have exact frame positions, we'll use a uniform distribution
// This assumes the sprite sheet is evenly divided into 8 frames
// The actual frame positions will need to be measured from the sprite sheet
// For now, we'll estimate based on a typical sprite sheet layout
const SPRITE_SHEET_WIDTH = 475; // Estimated total width (8 frames * ~384px each)
const FRAME_WIDTH = Math.floor(SPRITE_SHEET_WIDTH / ASTEROID_COUNT);

/**
 * Create frames for all asteroids
 * @returns Array of frame data [x, y, width, height] for each asteroid
 */
function createAsteroidFrames(): number[][] {
	const frames: number[][] = [];
	for (let i = 0; i < ASTEROID_COUNT; i++) {
		const x = i * FRAME_WIDTH;
		frames.push([x, 0, FRAME_WIDTH, FRAME_HEIGHT]);
	}
	return frames;
}

const asteroidFrames = createAsteroidFrames();

/**
 * Get a random asteroid frame
 * @returns Frame data [x, y, width, height] for a random asteroid
 */
export function getRandomAsteroidFrame(): number[] {
	const randomIndex = Math.floor(Math.random() * ASTEROID_COUNT);
	return asteroidFrames[randomIndex];
}

/**
 * Get a specific asteroid frame by index (0-7)
 * @param index - The index of the asteroid frame (0-7)
 * @returns Frame data [x, y, width, height] for the specified asteroid
 */
export function getAsteroidFrame(index: number): number[] {
	if (index < 0 || index >= ASTEROID_COUNT) {
		return asteroidFrames[0];
	}
	return asteroidFrames[index];
}

/**
 * Asteroid Sprite Config - Configuration for asteroid sprites
 * Note: This uses a single static frame per asteroid instance
 */
export const asteroidSpriteConfig: Omit<SpriteConfig, 'animations' | 'defaultAnimation'> = {
	imageUrl: '/assets/sprites/asteroid_sprite_sheet.png',
	frameRate: 1,
	scale: 1.5, // Adjust scale as needed
	frameWidth: FRAME_WIDTH,
	frameHeight: FRAME_HEIGHT,
};
