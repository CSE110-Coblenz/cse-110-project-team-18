import Konva from 'konva';
import { PlayerManager } from '../managers/PlayerManager';
import { CollisionManager } from '../collision/CollisionManager';
import { SpriteConfig } from '../movement/SpriteHelper';
import { MovementConfig } from '../../configs/MovementConfig';

export interface PlayerManagerFactoryOptions {
	group: Konva.Group;
	spriteConfig: SpriteConfig;
	position: { x: number; y: number };
	walkSpeed: number;
	model?: { x: number; y: number };
	movementConfig?: MovementConfig;
	collisionManager?: CollisionManager;
}

export interface PlayerManagerFactoryResult {
	playerManager: PlayerManager;
	collisionManager: CollisionManager;
	model: { x: number; y: number };
}

export function createPlayerManager(
	options: PlayerManagerFactoryOptions
): PlayerManagerFactoryResult {
	const collisionManager = options.collisionManager ?? new CollisionManager();
	const model = options.model ?? { x: options.position.x, y: options.position.y };
	model.x = options.position.x;
	model.y = options.position.y;

	const playerManager = new PlayerManager({
		group: options.group,
		spriteConfig: options.spriteConfig,
		x: options.position.x,
		y: options.position.y,
		walkSpeed: options.walkSpeed,
		model,
		movementConfig: options.movementConfig,
		collisionManager,
	});

	return { playerManager, collisionManager, model };
}
