# Theme System

This document describes the project's Theme System — a small, centralized token system that controls colors, typography, spacing and shadows so the UI looks consistent across screens.

## Purpose

- Centralize visual tokens (colors, type, spacing, shadows) in one place.
- Make it easy to switch themes at runtime and to preview variations during development.
- Ensure components consume tokens instead of hard-coded values so designs stay consistent when tokens change.

## Architecture overview

Key modules and responsibilities:

- `src/config/theme.ts`
  - Defines the `Theme` TypeScript type and exports a `defaultTheme` object with the token values.
- `src/core/ThemeManager.ts`
  - A minimal singleton that holds the active `Theme`, exposes `getTheme()` and `setTheme(next: Theme)`, and implements `subscribe(cb): () => void` for change notifications.
  - When a theme is set it updates `:root` CSS variables (via the helper) and notifies subscribers.
- `src/utils/themeHelpers.ts`
  - Utility to flatten nested tokens into CSS variables (e.g. `--theme-colors-primary`) and apply them to `document.documentElement`.
- `src/ui/ThemePanel.ts`
  - A tiny developer-facing floating widget with theme presets (Light / Dark). It mounts into the page and calls `ThemeManager.setTheme(preset)` when a preset is chosen.

## Usage guide

Accessing the current theme:

```ts
import ThemeManager from '../core/ThemeManager'

const theme = ThemeManager.getTheme()
console.log(theme.colors.primary, theme.typography.fontSize.md)
```

Switching or updating the theme at runtime:

```ts
import ThemeManager from '../core/ThemeManager'

// Replace the active theme with a different Theme object
ThemeManager.setTheme(newTheme)
```

The codebase provides no `updateToken` helper by default. If you need to update a single token you can produce a copy, change the token and call `setTheme`:

```ts
const t = ThemeManager.getTheme()
t.colors.primary = '#ff0000'
ThemeManager.setTheme(t)
```

Subscribing to theme changes (components / views):

```ts
const unsub = ThemeManager.subscribe((theme) => {
  // re-apply local styling based on tokens
})

// cleanup when component is destroyed
unsub()
```

## Built-in themes & Theme Panel

- Dark — the repository `defaultTheme` is a dark palette by default and is applied on start.
- Light — the `ThemePanel` includes a simple light preset which overrides a handful of tokens.
- Fun — not included by default. See "Extending the System" below to add a Fun preset.

Theme Panel access

- The Theme Panel is a small floating dev widget (bottom-right) that mounts non-invasively when the Menu screen is created. It is intended for development and quick visual checks. It can be mounted manually with:

```ts
import mountThemePanel from '../ui/ThemePanel'
const unmount = mountThemePanel()
// unmount() removes the panel
```

Note: The panel is a developer tool and can be gated behind a dev-only flag if you don't want it present in production builds.

## Best practices

- Prefer tokens over hard-coded values. Use `theme.colors`, `theme.typography`, `theme.spacing`, and `theme.shadows`.
- Read the theme via `ThemeManager.getTheme()` and apply values to UI elements.
- Use `ThemeManager.subscribe(...)` when a component needs to react to runtime theme changes.
- Always unsubscribe in cleanup (component `destroy`, `unmount`, or equivalent) to avoid memory leaks.

## Extending the system

To add a new token or preset:

1. Update the `Theme` type in `src/config/theme.ts` to include the new token key.
2. Add a sensible default value in the exported `defaultTheme` in the same file.
3. Update or add presets in `src/ui/ThemePanel.ts` (or wherever you manage presets) so the new token is present in other themes.
4. Update any components that should consume the new token.

Example: add `brandAccent` to colors

1. Edit `src/config/theme.ts` to add `brandAccent: string` under `colors` and provide `defaultTheme.colors.brandAccent = '#...'.`
2. Update `src/ui/ThemePanel.ts` presets to set `colors.brandAccent` for Light/Dark variants.

## Testing & QA checklist

- Verify that `ThemeManager.setTheme(...)` updates `:root` CSS variables and that components that consume tokens update visually.
- Test Dark and Light presets for contrast and legibility.
- If you add a new preset (e.g. Fun), validate spacing/typography across screens.
- Confirm there are no flickers, layout jumps or memory leaks when switching themes repeatedly.
- Cross-browser smoke: Chrome, Firefox, Safari.

## Change process

- Record theme token changes and rationale in this document (`docs/theme.md`) or link to the PR that introduced the change.
- For non-trivial visual changes, include before/after screenshots in the PR and have at least one reviewer verify contrast and spacing.

## Notes

- The Theme System is intentionally tiny and dependency free. It writes CSS variables to `:root` so stylesheets and components can consume tokens via JS or CSS variables.
- If you'd like CSS-first tokens (CSS custom properties in source CSS files) or design-tool sync, we can add an export step to generate a token CSS file from `src/config/theme.ts`.
