import { STAGE_WIDTH, STAGE_HEIGHT } from './GameConfig';

export const ProjectileConfig = {
	DIRECTION: { x: 0, y: -1 } as const,
	BOUNDS: { width: STAGE_WIDTH, height: STAGE_HEIGHT } as const,
	FIRE_COOLDOWN_MS: 250,
	OFFSET_Y: -50,
	INITIAL_TIME_SINCE_LAST_SHOT: Number.POSITIVE_INFINITY,
} as const;