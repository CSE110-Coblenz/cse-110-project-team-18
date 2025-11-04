import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { AsteroidFieldGameView } from './AsteroidFieldGameView.ts';
import { AsteroidFieldGameModel } from './AsteroidFieldGameModel.ts';
import { STAGE_WIDTH } from '../../configs/GameConfig';
import { PlayerManager } from '../../core/movement/PlayerManager';
import { CollisionManager } from '../../core/collision/CollisionManager';
import { spaceship_sprite } from '../../core/sprites/SpaceShipSprite';
import { PlayerConfig } from '../../configs/PlayerConfig';

 export class AsteroidFieldGameController extends ScreenController {

 }