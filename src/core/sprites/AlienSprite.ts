import { SpriteConfig } from '../movement/SpriteHelper';
const frameHeight = 462;

// X-coordinates for the start of each frame
const frameXCoordinates = [
	1, 216, 441, 678, 893, 1100, 1304, 1499, 1701, 1896, 2078, 2264, 2442, 2638, 2834, 3053, 3232,
	3438, 3658, 3926, 4163, 4428, 4760,
];

/**
 * Calculate the frame widths
 * @returns The frame widths
 */
function calculateFrameWidths(): number[] {
	const widths: number[] = [];
	for (let i = 0; i < frameXCoordinates.length - 1; i++)
		widths.push(frameXCoordinates[i + 1] - frameXCoordinates[i]);

	return widths;
}

const frameWidths = calculateFrameWidths();

/**
 * Create frames using actual coordinates
 * @param startFrameIndex - The index of the first frame
 * @param count - The number of frames to create
 * @returns The frames
 */
function createFrames(startFrameIndex: number, count: number): number[] {
	const frames: number[] = [];
	for (let i = 0; i < count && startFrameIndex + i < frameXCoordinates.length; i++) {
		const frameIndex = startFrameIndex + i;
		const x = frameXCoordinates[frameIndex];
		const width = frameWidths[frameIndex];
		frames.push(x, 0, width, frameHeight);
	}
	return frames;
}

/**
 * Calculate the average frame width
 * @returns The average frame width
 */
const averageFrameWidth = Math.round(
	frameWidths.reduce((sum, w) => sum + w, 0) / frameWidths.length
);

/**
 * Create idle animation with longer hold on first frame
 * @returns The idle animation
 */
function createIdleAnimation(): number[] {
	const frames: number[] = [];
	const firstFrame = createFrames(0, 1); // Just the first frame (non-blinking)

	// Repeat the first frame 5 times to hold it longer (non-blinking pose)
	for (let i = 0; i < 5; i++) {
		frames.push(...firstFrame);
	}

	// Then add all 3 idle frames for the blink animation
	frames.push(...createFrames(0, 3));

	return frames;
}

/**
 * Green Alien Sprite - The sprite for the green alien
 * @returns The green alien sprite
 */
export const greenAlienSprite: SpriteConfig = {
	imageUrl: '/assets/sprites/green_alien_sprite_sheet.png',
	animations: {
		// Idle: holds non-blinking frame, then cycles through blink frames
		idle: createIdleAnimation(),
		turn: createFrames(3, 3),
		walk: createFrames(6, 6),
		run: createFrames(12, 6),
		jump: createFrames(18, 4),
	},
	defaultAnimation: 'idle',
	frameRate: 8, // Default frame rate for walk, run, jump
	// Slower frame rate for idle animation to make it feel more relaxed
	animationFrameRates: {
		idle: 4, // Much slower for idle (will hold frames longer)
		walk: 8,
		run: 10,
		jump: 8,
	},
	scale: 0.25,
	// Use average frame width for PlayerManager sizing calculations
	frameWidth: averageFrameWidth,
	frameHeight: frameHeight,
};
