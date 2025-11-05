This guide explains how to load characters, sprites, and animations in Math Explorers: Galactic Quest.

## Overview

Characters are loaded using the `PlayerManager` class, which handles:

- Loading sprite images
- Creating Konva sprites with animations
- Managing player movement and animations
- Handling collision detection

## Architecture

### Components

1. **SpriteConfig**: Configuration object defining sprite properties and animations
2. **PlayerManager**: Manages sprite loading, animation, and player state
3. **AssetLoader**: Utility for loading images asynchronously
4. **Player**: GameObject representing the player character

## Step-by-Step: Loading a Character

### Step 1: Prepare Your Sprite Sheet

Place your sprite sheet image in `public/assets/sprites/` (e.g., `my_character.png`).

Requirements:

- Sprite sheet should be horizontal (frames left to right)
- All frames should be the same height
- Frame widths can vary

### Step 2: Create Sprite Configuration

Create a new file in `src/core/sprites/` (e.g., `MyCharacterSprite.ts`):

```typescript
import { SpriteConfig } from '../movement/SpriteHelper';

const frameHeight = 100; // Height of each frame in pixels
const frameWidth = 100; // Width of each frame (or average if varying)

// Define frame X coordinates (start of each frame in sprite sheet)
const frameXCoordinates = [0, 100, 200, 300, 400, 500];

// Calculate frame widths
function calculateFrameWidths(): number[] {
	const widths: number[] = [];
	for (let i = 0; i < frameXCoordinates.length - 1; i++) {
		widths.push(frameXCoordinates[i + 1] - frameXCoordinates[i]);
	}
	// For last frame, use average or specific width
	widths.push(100); // Last frame width
	return widths;
}

const frameWidths = calculateFrameWidths();
const averageFrameWidth = Math.round(
	frameWidths.reduce((sum, w) => sum + w, 0) / frameWidths.length
);

// Helper to create animation frames
function createFrames(startFrameIndex: number, count: number): number[] {
	const frames: number[] = [];
	for (let i = 0; i < count && startFrameIndex + i < frameXCoordinates.length; i++) {
		const frameIndex = startFrameIndex + i;
		const x = frameXCoordinates[frameIndex];
		const width = frameWidths[frameIndex];
		frames.push(x, 0, width, frameHeight); // [x, y, width, height]
	}
	return frames;
}

export const myCharacterSprite: SpriteConfig = {
	imageUrl: '/assets/sprites/my_character.png',
	animations: {
		idle: createFrames(0, 4), // Frames 0-3
		walk: createFrames(4, 6), // Frames 4-9
		run: createFrames(10, 6), // Frames 10-15
		jump: createFrames(16, 4), // Frames 16-19
	},
	defaultAnimation: 'idle',
	frameRate: 8, // Default frame rate
	animationFrameRates: {
		idle: 4, // Slower for idle
		walk: 8,
		run: 10, // Faster for run
		jump: 8,
	},
	scale: 0.5, // Scale factor (0.5 = 50% size)
	frameWidth: averageFrameWidth,
	frameHeight: frameHeight,
};
```

### Step 3: Use PlayerManager in Your Controller

In your screen controller (e.g., `GameScreenController.ts`):

```typescript
import { PlayerManager } from '../../core/movement/PlayerManager';
import { CollisionManager } from '../../core/collision/CollisionManager';
import { myCharacterSprite } from '../../core/sprites/MyCharacterSprite';
import { PlayerConfig } from '../../configs/PlayerConfig';

export class GameScreenController extends ScreenController {
	private playerManager?: PlayerManager | null;
	private collisionManager?: CollisionManager | null;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		// ... other initialization

		// Create collision manager
		this.collisionManager = new CollisionManager();

		// Create player manager
		this.playerManager = new PlayerManager({
			group: this.view.getGroup(), // Add to screen's Konva group
			spriteConfig: myCharacterSprite,
			x: 100, // Starting X position
			y: 300, // Starting Y position
			walkSpeed: PlayerConfig.MOVEMENT.WALK_SPEED,
			runSpeed: PlayerConfig.MOVEMENT.WALK_SPEED * PlayerConfig.MOVEMENT.RUN_SPEED_MULTIPLIER,
			collisionManager: this.collisionManager,
		});
	}

	override update(deltaTime: number): void {
		// Update player manager (handles movement and animations)
		if (this.view.getGroup().visible()) {
			this.playerManager?.update(deltaTime);
			this.collisionManager?.update();
			this.view.getGroup().getLayer()?.draw();
		}
	}
}
```

### Step 4: Example from MenuScreen

Here's how it's done in `MenuScreenController.ts`:

```typescript
import { greenAlienSprite } from '../../core/sprites/AlienSprite';

constructor(screenSwitcher: ScreenSwitcher) {
    // Create model
    this.model = new MenuScreenModel(STAGE_WIDTH / 4, 250);

    // Create collision manager
    this.collisionManager = new CollisionManager();

    // Create player manager
    this.playerManager = new PlayerManager({
        group: this.view.getGroup(),
        spriteConfig: greenAlienSprite,
        x: this.model.player.x,
        y: this.model.player.y,
        walkSpeed: PlayerConfig.MOVEMENT.WALK_SPEED,
        model: this.model.player, // Optional: sync with external model
        collisionManager: this.collisionManager,
    });
}
```

## SpriteConfig Interface

The `SpriteConfig` interface defines all sprite properties:

```typescript
interface SpriteConfig {
	imageUrl: string; // Path to sprite sheet
	animations: Record<string, number[]>; // Animation name -> frame data
	defaultAnimation: string; // Animation to play on load
	frameRate?: number; // Default frames per second
	animationFrameRates?: Record<string, number>; // Per-animation frame rates
	scale?: number; // Scale factor (0-1)
	frameWidth: number; // Width of frames
	frameHeight: number; // Height of frames
}
```

### Frame Data Format

Animation frames are arrays of numbers: `[x, y, width, height, x2, y2, width2, height2, ...]`

Each frame is defined by 4 numbers:

- `x`: X position in sprite sheet
- `y`: Y position in sprite sheet (usually 0)
- `width`: Frame width
- `height`: Frame height

## PlayerManager Options

```typescript
interface PlayerManagerOptions {
	group: Konva.Group; // Konva group to add sprite to
	spriteConfig: SpriteConfig; // Sprite configuration
	x: number; // Starting X position
	y: number; // Starting Y position
	scale?: number; // Additional scale (optional)
	walkSpeed: number; // Movement speed (pixels/second)
	runSpeed?: number; // Running speed (optional)
	model?: { x: number; y: number }; // External model to sync with (optional)
	collisionManager?: CollisionManager; // Collision manager (optional)
}
```

## Animation System

### Automatic Animations

`PlayerManager` automatically switches animations based on player state:

- **idle**: When not moving
- **walk**: When moving at walk speed
- **run**: When moving with shift held
- **jump**: When jumping
- **turn**: When changing direction

### Manual Animation Control

You can access the sprite node for manual control:

```typescript
const spriteNode = this.playerManager?.getNode() as Konva.Sprite;
if (spriteNode) {
	spriteNode.animation('customAnimation');
	spriteNode.start();
}
```

## Character Positioning

### Initial Position

Set in `PlayerManager` constructor:

```typescript
this.playerManager = new PlayerManager({
	// ...
	x: 100, // Starting X
	y: 300, // Starting Y
});
```

### Using a Model

For persistent state, use a model:

```typescript
// In your model
export class GameScreenModel {
	player: PlayerModel = { x: 100, y: 300 };
}

// In controller
this.model = new GameScreenModel();
this.playerManager = new PlayerManager({
	// ...
	model: this.model.player, // Syncs with model
});
```

## Collision Detection

Characters automatically register with `CollisionManager` if provided:

```typescript
this.collisionManager = new CollisionManager();
this.playerManager = new PlayerManager({
	// ...
	collisionManager: this.collisionManager,
});

// In update loop
this.collisionManager?.update();
```

## Best Practices

1. **Consistent frame heights**: All frames should have the same height
2. **Use helper functions**: `createFrames()` simplifies frame definition
3. **Calculate frame widths**: If frames vary in width, calculate them
4. **Set appropriate frame rates**: Idle should be slower, run faster
5. **Use models for state**: Sync position with external models
6. **Clean up on dispose**: Call `playerManager.dispose()` when removing

## Example: Complete Character Setup

```typescript
// 1. Sprite config (MyCharacterSprite.ts)
export const heroSprite: SpriteConfig = {
    imageUrl: '/assets/sprites/hero.png',
    animations: {
        idle: createFrames(0, 4),
        walk: createFrames(4, 6),
    },
    defaultAnimation: 'idle',
    frameRate: 8,
    scale: 0.5,
    frameWidth: 100,
    frameHeight: 100,
};

// 2. Controller setup
this.collisionManager = new CollisionManager();
this.playerManager = new PlayerManager({
    group: this.view.getGroup(),
    spriteConfig: heroSprite,
    x: 200,
    y: 400,
    walkSpeed: 150,
    collisionManager: this.collisionManager,
});

// 3. Update loop
override update(deltaTime: number): void {
    if (this.view.getGroup().visible()) {
        this.playerManager?.update(deltaTime);
        this.collisionManager?.update();
        this.view.getGroup().getLayer()?.draw();
    }
}
```

## Troubleshooting

### Character not appearing

- ✅ Check sprite image path (relative to `public/`)
- ✅ Verify sprite sheet is loaded (check browser console)
- ✅ Ensure group is visible and added to layer
- ✅ Check frame dimensions match sprite sheet

### Animations not playing

- ✅ Verify animation names match sprite config
- ✅ Check frame data is correct (x, y, width, height)
- ✅ Ensure sprite is started: `sprite.start()`

### Character position wrong

- ✅ Check X/Y coordinates are correct
- ✅ Verify sprite offset is set correctly
- ✅ Check scale is applied properly

### Performance issues

- ✅ Optimize frame rates (lower = better performance)
- ✅ Reduce number of frames per animation
- ✅ Use appropriate sprite sheet sizes
