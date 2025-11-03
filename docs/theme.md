# Theme System

The theme system provides a centralized way to manage colors, typography, spacing, and other visual tokens across the game. It supports runtime theme switching and dynamic updates.

## Overview

- **Source of truth**: All theme tokens are defined in `src/config/theme.ts`
- **Runtime management**: `ThemeManager` singleton handles theme updates and notifications
- **Live updates**: UI components subscribe to theme changes and update in real-time
- **CSS Variables**: Theme tokens are also exported as CSS variables for DOM/CSS usage

## Theme Structure

```typescript
type Theme = {
  colors: {
    primary: string;      // Main action color
    primaryDark: string;  // Darker variant of primary
    accent: string;       // Secondary emphasis color
    background: string;   // Page/screen background
    panel: string;       // UI panel backgrounds
    textPrimary: string; // Main text color
    textSecondary: string; // Secondary text color
  };
  typography: {
    fontFamily: string;  // Font stack
    sizeLarge: number;   // Large text (e.g., titles)
    sizeBase: number;    // Base text size
    sizeSmall: number;   // Small text
  };
  spacing: {
    xs: number;  // Extra small spacing (4px)
    sm: number;  // Small spacing (8px)
    md: number;  // Medium spacing (16px)
    lg: number;  // Large spacing (24px)
  };
  shadows: {
    small: string;  // Subtle shadow
    medium: string; // More prominent shadow
  };
}
```

## Using the Theme System

### In TypeScript/JavaScript (Konva)

```typescript
import ThemeManager from '../core/ThemeManager';

// Reading theme values
const theme = ThemeManager.getTheme();
const primaryColor = theme.colors.primary;

// Subscribing to theme changes
const unsubscribe = ThemeManager.subscribe(() => {
  const theme = ThemeManager.getTheme();
  // Update your UI here
});

// Cleanup when component is destroyed
unsubscribe();
```

### CSS Variables

Theme tokens are automatically exported as CSS variables:

```css
.my-element {
  color: var(--theme-colors-primary);
  font-size: var(--theme-typography-sizeBase);
  margin: var(--theme-spacing-md);
}
```

## Theme Updates at Runtime

You can update the theme in two ways:

1. Replace entire theme:
```typescript
ThemeManager.setTheme(newTheme);
```

2. Update specific tokens:
```typescript
ThemeManager.updateToken(['colors', 'primary'], '#ff0000');
```

## Built-in Themes

The game includes several pre-built themes accessible through the theme panel (top-left corner in menu):

- **Dark** (default): Dark background with green accents
- **Light**: Light background with blue accents
- **Fun**: Vibrant purple/pink theme

## Development Tools

### Theme Panel

During development, use the theme panel (top-left in menu screen) to:
- Preview different themes
- Test theme transitions
- Verify UI updates correctly

### Adding New Theme Tokens

1. Add the token to the Theme type in `src/config/theme.ts`
2. Add a default value in `defaultTheme`
3. Update any theme presets in `ThemePanel.ts`

### Best Practices

1. **Always use theme tokens** instead of hard-coded values
2. **Subscribe to theme changes** in components that need live updates
3. **Clean up subscriptions** when components are destroyed
4. **Use semantic token names** (e.g., 'primary' not 'green')

## QA Checklist

When testing theme changes:

1. **Visual consistency**
   - All UI elements use theme colors
   - Typography is consistent
   - Spacing follows theme tokens

2. **Runtime updates**
   - UI updates immediately when theme changes
   - No flicker or visual artifacts
   - Transitions are smooth

3. **Accessibility**
   - Text remains readable in all themes
   - Sufficient contrast ratios
   - Interactive elements remain distinguishable

4. **Performance**
   - No lag when switching themes
   - Memory usage stable over many theme switches