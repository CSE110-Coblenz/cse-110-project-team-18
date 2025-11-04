This guide explains how to handle user input in Math Explorers: Galactic Quest, including keyboard input and mouse/click events.

## Overview

The project uses two main approaches for input:

1. **InputManager**: Centralized keyboard input handling (singleton pattern)
2. **Konva Events**: Direct event handling for mouse clicks and interactions on Konva nodes

## Keyboard Input

### InputManager

The `InputManager` is a singleton that tracks keyboard state across the entire application.

#### Initialization

The `InputManager` is initialized once in `src/main.ts`:

```typescript
InputManager.getInstance().initialize();
```

#### Checking Key States

Use `InputManager` to check if keys are currently pressed:

```typescript
import { InputManager } from '../core/input/InputManager';

const inputManager = InputManager.getInstance();

// In your update loop
if (inputManager.isKeyPressed('w')) {
	// Move up
}

if (inputManager.isKeyPressed('a')) {
	// Move left
}

// Check multiple keys
if (inputManager.isAnyKeyPressed(['w', 'arrowup'])) {
	// Move up (either W or Up Arrow)
}
```

#### Example: Player Movement

The player movement system uses `InputManager` in `PlayerMovement.ts`:

```typescript
const inputManager = InputManager.getInstance();

// Check movement keys
const moveUp = inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_UP);
const moveDown = inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_DOWN);
const moveLeft = inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_LEFT);
const moveRight = inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.MOVE_RIGHT);
const jump = inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.JUMP);
const run = inputManager.isAnyKeyPressed(PlayerConfig.CONTROLS.RUN);
```

#### Available Methods

- `isKeyPressed(key: string)`: Check if a specific key is pressed
- `isAnyKeyPressed(keys: readonly string[])`: Check if any of the given keys are pressed
- `getPressedKeys()`: Get all currently pressed keys (read-only Set)
- `clear()`: Clear all key states (useful for pause/reset)

#### Key Names

Keys are stored in lowercase for consistency. Common keys:

- Letters: `'a'`, `'b'`, `'w'`, `'d'`, etc.
- Arrows: `'arrowup'`, `'arrowdown'`, `'arrowleft'`, `'arrowright'`
- Space: `' '`
- Modifiers: `'shift'`, `'ctrl'`, `'alt'`

### Using InputManager in Controllers

Example from a game screen controller:

```typescript
export class GameScreenController extends ScreenController {
	override update(deltaTime: number): void {
		const inputManager = InputManager.getInstance();

		// Check for pause
		if (inputManager.isKeyPressed('escape')) {
			this.pauseGame();
		}

		// Check for menu
		if (inputManager.isKeyPressed('m')) {
			this.screenSwitcher.switchToScreen({ type: 'menu' });
		}

		// Update game logic
		// ...
	}
}
```

## Mouse and Click Events

### Konva Event System

For mouse clicks, hover, and other interactions on Konva nodes, use Konva's built-in event system directly.

#### Basic Click Event

```typescript
const button = new Konva.Rect({
	x: 100,
	y: 100,
	width: 200,
	height: 50,
	fill: 'blue',
});

button.on('click', () => {
	console.log('Button clicked!');
	// Handle click
});

group.add(button);
```

#### Example: Menu Start Button

From `MenuScreenView.ts`:

```typescript
const startButtonGroup = new Konva.Group();
const startButton = new Konva.Rect({
	x: STAGE_WIDTH / 2 - 100,
	y: 300,
	width: 200,
	height: 60,
	fill: 'green',
});

startButtonGroup.add(startButton);
startButtonGroup.on('click', onStartClick); // Handler passed from controller
this.group.add(startButtonGroup);
```

#### Available Mouse Events

Konva supports many mouse events:

- `'click'`: Single click
- `'dblclick'`: Double click
- `'mousedown'`: Mouse button pressed
- `'mouseup'`: Mouse button released
- `'mouseover'`: Mouse enters node
- `'mouseout'`: Mouse leaves node
- `'mousemove'`: Mouse moves over node
- `'contextmenu'`: Right-click

#### Getting Mouse Position

```typescript
button.on('click', (e) => {
	const stage = e.target.getStage();
	const pointerPos = stage.getPointerPosition();
	console.log('Clicked at:', pointerPos.x, pointerPos.y);
});
```

#### Event Object

The event handler receives a Konva event object:

```typescript
button.on('click', (e) => {
	const target = e.target; // The Konva node that was clicked
	const evt = e.evt; // Original browser event
	const stage = e.target.getStage(); // The Konva stage
});
```

## Step-by-Step: Adding Click Events

### Step 1: Create the Konva Node

```typescript
const clickableRect = new Konva.Rect({
	x: 50,
	y: 50,
	width: 100,
	height: 50,
	fill: 'red',
});
```

### Step 2: Add Event Listener

```typescript
clickableRect.on('click', () => {
	// Your click handler
	this.handleClick();
});
```

### Step 3: Add to Group

```typescript
this.group.add(clickableRect);
```

### Step 4: Make it Interactive (Optional)

For better UX, add hover effects:

```typescript
clickableRect.on('mouseover', () => {
	clickableRect.fill('darkred');
});

clickableRect.on('mouseout', () => {
	clickableRect.fill('red');
});
```

## Advanced: Interactive Objects

### Creating Clickable Game Objects

```typescript
export class ClickableObject {
	private shape: Konva.Rect;

	constructor(x: number, y: number, onClick: () => void) {
		this.shape = new Konva.Rect({
			x,
			y,
			width: 50,
			height: 50,
			fill: 'blue',
		});

		this.shape.on('click', onClick);
		this.shape.on('mouseover', () => {
			this.shape.fill('lightblue');
		});
		this.shape.on('mouseout', () => {
			this.shape.fill('blue');
		});
	}

	addToGroup(group: Konva.Group) {
		group.add(this.shape);
	}
}
```

### Removing Event Listeners

```typescript
// Remove specific listener
button.off('click', handler);

// Remove all listeners of a type
button.off('click');

// Remove all listeners
button.off();
```

## Best Practices

1. **Use InputManager for keyboard**: Centralized keyboard input
2. **Use Konva events for mouse**: Direct event handling on Konva nodes
3. **Check input in update loop**: For continuous keyboard input
4. **Use event handlers for clicks**: For one-time interactions
5. **Remove listeners on cleanup**: Prevent memory leaks
6. **Use PlayerConfig for controls**: Centralize control mappings

## Configuration

Player controls are defined in `src/configs/PlayerConfig.ts`:

```typescript
export const PlayerConfig = {
	CONTROLS: {
		MOVE_UP: ['w', 'arrowup'],
		MOVE_DOWN: ['s', 'arrowdown'],
		MOVE_LEFT: ['a', 'arrowleft'],
		MOVE_RIGHT: ['d', 'arrowright'],
		JUMP: [' '],
		RUN: ['shift', 'Shift', 'ShiftLeft', 'ShiftRight'],
	},
};
```

## Troubleshooting

### Keys not registering

- ✅ Ensure `InputManager.getInstance().initialize()` is called
- ✅ Check key names are lowercase
- ✅ Verify you're checking keys in the update loop

### Click events not firing

- ✅ Ensure node is added to a group that's in the layer
- ✅ Check that group is visible
- ✅ Verify node is not behind another node (z-index)
- ✅ Ensure stage is listening to events

### Multiple clicks firing

- ✅ Check for duplicate event listeners
- ✅ Verify event propagation (use `e.cancelBubble = true` if needed)
