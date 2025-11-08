import Konva from 'konva';
import { PlayerManager } from '../managers/PlayerManager';
import { CollisionManager } from '../collision/CollisionManager';
import { SpriteConfig } from '../movement/SpriteHelper';
import { MovementConfig } from '../../configs/MovementConfig';

/**
 * PlayerManagerFactoryOptions - Options for the player manager factory
 * @param group - The group to add the player to
 * @param spriteConfig - The sprite configuration
 * @param position - The position of the player
 * @param walkSpeed - The walk speed of the player
 * @param model - The model of the player
 * @param movementConfig - The movement configuration
 * @param collisionManager - The collision manager
 */
export interface PlayerManagerFactoryOptions {
	group: Konva.Group;
	spriteConfig: SpriteConfig;
	position: { x: number; y: number };
	walkSpeed: number;
	model?: { x: number; y: number };
	movementConfig?: MovementConfig;
	collisionManager?: CollisionManager;
}

/**
 * PlayerManagerFactoryResult - The result of the player manager factory
 * @param playerManager - The player manager
 * @param collisionManager - The collision manager
 * @param model - The model of the player
 */
export interface PlayerManagerFactoryResult {
	playerManager: PlayerManager;
	collisionManager: CollisionManager;
	model: { x: number; y: number };
}

/**
 * Create a player manager
 * @param options - The options for the player manager
 * @returns The player manager factory result
 */
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
