This guide explains how screen switching works in Math Explorers: Galactic Quest and how to add new screens.

## Overview

The application uses a screen management system where:

- All screens exist simultaneously but only one is visible at a time
- Each screen is a Konva Group that can be shown/hidden
- Screen controllers manage the Model-View-Controller pattern for each screen
- The main `App` class coordinates screen switching

## How Screen Switching Works

### Architecture

1. **ScreenSwitcher Interface**: Defines the contract for switching screens

   ```typescript
   interface ScreenSwitcher {
   	switchToScreen(screen: Screen): void;
   }
   ```

2. **Screen Types**: Defined in `src/types.ts`

   ```typescript
   type Screen = { type: 'menu' } | { type: 'game' } | { type: 'result'; score: number };
   ```

3. **Screen Controllers**: Each screen extends `ScreenController` and implements:
   - `getView()`: Returns the view
   - `show()`: Shows the screen
   - `hide()`: Hides the screen
   - `update(deltaTime)`: Updates the screen (called by game loop)

4. **App Class**: Implements `ScreenSwitcher` and manages all controllers

### The Switch Process

When `switchToScreen()` is called:

1. **Hide all screens**: All screen controllers' `hide()` methods are called
2. **Show target screen**: The target screen's `show()` method is called
3. **Set active controller**: The active controller is updated for the game loop

Example from `src/main.ts`:

```typescript
switchToScreen(screen: Screen): void {
    // Hide all screens
    this.menuController.hide();
    // this.gameController.hide();
    // this.resultsController.hide();

    // Show the requested screen
    switch (screen.type) {
        case 'menu':
            this.menuController.show();
            this.activeController = this.menuController;
            break;
        // ... other cases
    }
}
```

## Step-by-Step: Adding a New Screen

### Step 1: Create Screen Files

Create a new folder in `src/screens/` (e.g., `GameScreen/`) and create three files:

#### GameScreenModel.ts

```typescript
/**
 * GameScreenModel - The model for the game screen
 */
export class GameScreenModel {
	// Add your game state here
	score: number = 0;

	constructor() {
		// Initialize model
	}
}
```

#### GameScreenView.ts

```typescript
import Konva from 'konva';
import type { View } from '../../types.ts';

/**
 * GameScreenView - Renders the game screen
 */
export class GameScreenView implements View {
	private group: Konva.Group;

	constructor() {
		this.group = new Konva.Group({
			visible: false, // Start hidden
			id: 'gameScreen',
		});

		// Add your UI elements here
		const title = new Konva.Text({
			x: 100,
			y: 50,
			text: 'Game Screen',
			fontSize: 32,
			fill: 'white',
		});
		this.group.add(title);
	}

	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}
}
```

#### GameScreenController.ts

```typescript
import { ScreenController } from '../../types.ts';
import type { ScreenSwitcher } from '../../types.ts';
import { GameScreenView } from './GameScreenView.ts';
import { GameScreenModel } from './GameScreenModel.ts';

/**
 * GameScreenController - Handles game screen interactions
 */
export class GameScreenController extends ScreenController {
	private view: GameScreenView;
	private screenSwitcher: ScreenSwitcher;
	private model: GameScreenModel;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new GameScreenView();
		this.model = new GameScreenModel();
	}

	getView(): GameScreenView {
		return this.view;
	}

	override show(): void {
		super.show();
		// Add any initialization logic here
	}

	override hide(): void {
		super.hide();
		// Add any cleanup logic here
	}

	override update(deltaTime: number): void {
		// Update game logic here
		// This is called every frame by the game loop
	}
}
```

### Step 2: Register Screen in main.ts

1. **Import the controller**:

   ```typescript
   import { GameScreenController } from './screens/GameScreen/GameScreenController.ts';
   ```

2. **Add controller property**:

   ```typescript
   class App implements ScreenSwitcher {
   	// ... existing code
   	private gameController: GameScreenController;
   }
   ```

3. **Initialize in constructor**:

   ```typescript
   constructor(container: string) {
       // ... existing initialization

       this.gameController = new GameScreenController(this);

       // ... rest of constructor
   }
   ```

4. **Add screen group to layer**:

   ```typescript
   // In constructor, after creating controllers
   this.layer.add(this.gameController.getView().getGroup());
   ```

5. **Add case in switchToScreen()**:
   ```typescript
   switchToScreen(screen: Screen): void {
       // Hide all screens
       this.menuController.hide();
       this.gameController.hide();
       // Show requested screen
       switch (screen.type) {
           case 'menu':
               this.menuController.show();
               this.activeController = this.menuController;
               break;
           case 'game':
               this.gameController.show();
               this.activeController = this.gameController;
               break;
       }
   }
   ```

### Step 3: Update Screen Type

Add your new screen type to `src/types.ts`:

```typescript
export type Screen =
	| { type: 'menu' }
	| { type: 'game' } // Your new screen
	| { type: 'result'; score: number };
```

### Step 4: Switch to Your Screen

From any controller, you can switch to your screen:

```typescript
this.screenSwitcher.switchToScreen({ type: 'game' });
```

## Example: Menu to Game Screen

Here's how the menu screen switches to the game screen:

```typescript
// In MenuScreenController.ts
private handleStartClick(): void {
    this.screenSwitcher.switchToScreen({ type: 'game' });
}

// In MenuScreenView.ts
startButtonGroup.on('click', onStartClick);
```

## Screen Lifecycle

### Initialization

- Constructor called when `App` is created
- Screen groups are added to the layer
- Screens start hidden (except the initial screen)

### Showing

- `show()` is called by `switchToScreen()`
- View's group visibility is set to `true`
- Controller can initialize resources here

### Active (Visible)

- `update(deltaTime)` is called every frame
- Only the active screen's `update()` is called
- Handle game logic, input, animations here

### Hiding

- `hide()` is called when switching away
- View's group visibility is set to `false`
- Controller can pause/cleanup here

## Best Practices

1. **Start screens hidden**: Set `visible: false` in view constructor
2. **Clean up in hide()**: Stop animations, clear timers, etc.
3. **Initialize in show()**: Load resources when screen becomes visible
4. **Update only when visible**: Check visibility in `update()` if needed
5. **Use the model**: Store screen state in the model, not the view
6. **Handle async loading**: Use async/await for asset loading

## Common Patterns

### Passing Data Between Screens

Use the `Screen` type to pass data:

```typescript
// In types.ts
export type Screen =
    | { type: 'game'; level: number }
    | { type: 'result'; score: number };

// When switching
this.screenSwitcher.switchToScreen({ type: 'game', level: 5 });

// In controller
case 'game':
    if (screen.level !== undefined) {
        this.gameController.setLevel(screen.level);
    }
    break;
```

### Conditional Screen Switching

```typescript
if (player.hasWon()) {
	this.screenSwitcher.switchToScreen({ type: 'result', score: player.score });
} else {
	this.screenSwitcher.switchToScreen({ type: 'game' });
}
```

## Troubleshooting

### Screen not showing

- ✅ Check that screen group is added to layer
- ✅ Verify `switchToScreen()` case is implemented
- ✅ Ensure `show()` sets `group.visible(true)`

### Screen not updating

- ✅ Verify controller is set as `activeController`
- ✅ Check that `update()` is implemented
- ✅ Ensure game loop is running

### Screen not hiding

- ✅ Check that `hide()` is called in `switchToScreen()`
- ✅ Verify `hide()` sets `group.visible(false)`
