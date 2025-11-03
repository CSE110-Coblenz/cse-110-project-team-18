# MATH EXPLORERS: GALACTIC QUEST
An educational math game created for CSE 110.

## Features

### Theme System
The game uses a centralized theme system for consistent styling:
- Configurable colors, typography, spacing, and shadows
- Runtime theme switching with live UI updates
- Built-in light/dark themes
- Theme development panel (top-left in menu)

See [Theme Documentation](docs/theme.md) for details.

## Development

### format all files with Prettier
- npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-import prettier eslint-plugin-prettier eslint-config-prettier
- npm run format

## run eslint and auto-fix fixable problems (forward --fix to the npm script)
- npm run lint --fix

## setup/start program
- npm install
- npm run dev
