Welcome to the Math Explorers: Galactic Quest developer guide! This document provides an overview of the codebase architecture and guides you through common development tasks.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
- [Common Tasks](#common-tasks)
- [Project Structure](#project-structure)
- [Related Guides](#related-guides)

## Architecture Overview

This project follows a **Model-View-Controller (MVC)** architecture pattern with the following key components:

- **Models**: Store game state and data (e.g., `MenuScreenModel`, `PlayerModel`)
- **Views**: Handle rendering using Konva.js (e.g., `MenuScreenView`)
- **Controllers**: Coordinate between models and views, handle user input (e.g., `MenuScreenController`)
- **Managers**: Handle complex subsystems (e.g., `PlayerManager`, `InputManager`, `CollisionManager`)

### Key Technologies

- **Konva.js**: 2D canvas library for rendering
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server

## Quick Start

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Setup

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

### Building

```bash
npm run build
```

### Code Quality

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Documentation

```bash
# Generate API documentation and developer guides
npm run docs

# Serve documentation on localhost (http://localhost:3000)
npm run docs:serve
```

The documentation includes:
<<<<<<< HEAD
=======

>>>>>>> origin/main
- **API Documentation**: Auto-generated TypeDoc documentation for all TypeScript classes, interfaces, and functions
- **Developer Guides**: Step-by-step guides for common development tasks
  - [Developer Guide](./DEVELOPER_GUIDE.md) - This guide
  - [Screen Switching Guide](./SCREEN_SWITCHING.md)
  - [Input Handling Guide](./INPUT_HANDLING.md)
  - [Character Loading Guide](./CHARACTER_LOADING.md)

Access the documentation by:
<<<<<<< HEAD
=======

>>>>>>> origin/main
1. Running `npm run docs` to generate the documentation
2. Running `npm run docs:serve` to start the local server
3. Opening `http://localhost:3000` in your browser

## Common Tasks

### Adding a New Screen

1. Create a new folder in `src/screens/` (e.g., `GameScreen/`)
2. Create three files:
   - `GameScreenModel.ts` - Define the model/state
   - `GameScreenView.ts` - Define the view/rendering
   - `GameScreenController.ts` - Define the controller
3. Register the screen in `src/main.ts`:
   - Add controller instance
   - Add screen group to layer
   - Add case in `switchToScreen()`

See [Screen Switching Guide](./SCREEN_SWITCHING.md) for detailed instructions.

### Loading a Character

1. Create a sprite configuration file (e.g., `src/core/sprites/YourSprite.ts`)
2. Define the `SpriteConfig` with animations and frame data
3. Use `PlayerManager` in your controller to load the character

See [Character Loading Guide](./CHARACTER_LOADING.md) for detailed instructions.

### Adding Click Events

Use Konva's event system directly on Konva nodes:

```typescript
<<<<<<< HEAD
const button = new Konva.Rect({ /* ... */ });
button.on('click', () => {
    // Handle click
=======
const button = new Konva.Rect({
	/* ... */
});
button.on('click', () => {
	// Handle click
>>>>>>> origin/main
});
```

See [Input Handling Guide](./INPUT_HANDLING.md) for detailed instructions.

### Switching Between Screens

Use the `ScreenSwitcher` interface:

```typescript
this.screenSwitcher.switchToScreen({ type: 'game' });
```

See [Screen Switching Guide](./SCREEN_SWITCHING.md) for detailed instructions.

## Project Structure

```
src/
├── configs/          # Configuration files (GameConfig, PlayerConfig)
├── core/             # Core game systems
│   ├── collision/    # Collision detection
│   ├── input/        # Input handling (InputManager)
│   ├── movement/     # Movement system (PlayerManager, PlayerMovement)
│   ├── objects/      # Game objects (GameObject, Player, Collidable)
│   ├── sprites/      # Sprite configurations
│   └── utils/        # Utility functions (AssetLoader)
├── screens/          # Screen implementations (MVC pattern)
│   └── MenuScreen/   # Example screen
├── main.ts           # Application entry point
└── types.ts          # TypeScript type definitions
```

## Related Guides

- [Screen Switching Guide](./SCREEN_SWITCHING.md) - Detailed guide on screen management
- [Input Handling Guide](./INPUT_HANDLING.md) - Keyboard and mouse input
- [Character Loading Guide](./CHARACTER_LOADING.md) - Sprites and animations
- [API Documentation](./api/index.html) - Auto-generated API docs (run `npm run docs`)

## Best Practices

1. **Follow MVC Pattern**: Keep models, views, and controllers separate
2. **Use TypeScript Types**: Leverage TypeScript for type safety
3. **Centralize Input**: Use `InputManager` for keyboard input
4. **Use Konva Events**: For click/hover events on Konva nodes
5. **Async Asset Loading**: Use `preloadImage()` from `AssetLoader` for images
6. **Collision Management**: Register collidable objects with `CollisionManager`
7. **Screen Lifecycle**: Implement `show()`, `hide()`, and `update()` in controllers

## Troubleshooting

### Screen Not Showing

- Check that the screen's group is added to the layer in `main.ts`
- Verify `switchToScreen()` is called with the correct screen type
- Ensure the view's `show()` method sets `group.visible(true)`

### Character Not Loading

- Verify sprite image path is correct (relative to `public/`)
- Check browser console for loading errors
- Ensure `SpriteConfig` has correct frame dimensions

### Input Not Working

- Verify `InputManager.getInstance().initialize()` is called in `main.ts`
- Check that you're checking for keys in the update loop
- For mouse clicks, use Konva's `.on('click')` directly on nodes

## Getting Help

- Check the other documentation files in `docs/`
- Review existing screen implementations as examples
- Check TypeScript types in `src/types.ts` for interface definitions
<<<<<<< HEAD
- Generate and view full documentation: `npm run docs && npm run docs:serve`
=======
- Generate and view full documentation: `npm run docs && npm run docs:serve`
>>>>>>> origin/main
