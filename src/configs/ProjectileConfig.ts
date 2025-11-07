import { STAGE_WIDTH, STAGE_HEIGHT } from './GameConfig';

export const ProjectileConfig = {
	defaults: {
		initialTimeSinceLastShot: Number.POSITIVE_INFINITY,
	},
	variants: {
		laser: {
			imageUrl: '/assets/sprites/laser_shot_sprite.png',
			speed: 1000,
			scale: 0.2,
			direction: { x: 0, y: -1 } as const,
			bounds: { width: STAGE_WIDTH, height: STAGE_HEIGHT } as const,
			fireCooldownMs: 250,
			offsetY: -100,
		},
	},
} as const;
