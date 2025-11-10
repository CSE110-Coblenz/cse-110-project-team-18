# UI Element Factory Guide

This guide explains how to use the UI Element Factory (`src/ui/factory/ElementFactory.ts`) to create and manage interactive UI elements in our game using Konva.js.

## Table of Contents

- [Overview](#overview)
- [Button Creation](#button-creation)
- [Text Box Creation](#text-box-creation)
- [Element Updates](#element-updates)
- [Common Use Cases](#common-use-cases)

## Overview

The Element Factory provides functions to create consistent, theme-aware UI elements:

- `createButton()`: Creates interactive buttons with hover effects and click handling
- `createTextBox()`: Creates text display boxes with various alignment options
- Utility functions for updating text and resizing elements

All elements automatically handle:

- Text fitting and overflow management
- Proper vertical/horizontal alignment
- Theme integration
- Shadow effects and styling

## Button Creation

### Basic Usage

```typescript
const button = createButton({
	x: 100, // Optional, defaults to theme-defined position
	y: 200, // Required
	width: 200, // Required
	height: 60, // Required
	text: 'Click Me', // Required
	colorKey: 'primary', // Required - theme color key
});
```

### Full Configuration Options

```typescript
type ButtonArgs = {
	// Position and Size
	x?: number; // Optional X position
	y: number; // Y position
	width: number; // Button width
	height: number; // Button height

	// Content
	text: string; // Button text

	// Styling
	colorKey: string; // Theme color key for background
	fontColorKey?: string; // Theme color key for text (defaults to white)
	fontFamily?: string; // Font family (defaults to theme)
	fontSize?: number; // Initial font size (will auto-shrink if needed)
	fontWeight?: number; // Font weight

	// Interaction
	onClick?: () => void; // Click/tap handler
	hoverColorKey?: string; // Theme color for hover state

	// Text Fitting
	minFontSize?: number; // Minimum font size when shrinking (default: 12)
};
```

### Button Behaviors

- **Text Fitting**: Text automatically shrinks to fit button width while maintaining readability
- **Hover Effects**:
  - Background lightens on hover (or uses specified hoverColorKey)
  - Cursor changes to pointer
- **Click/Tap**: Handles both mouse clicks and touch events
- **Shadow**: Includes a subtle drop shadow for depth
- **Overflow Warning**: Console warning if text doesn't fit at minimum font size

## Text Box Creation

### Basic Usage

```typescript
const textBox = createTextBox({
	x: 100,
	y: 200,
	width: 300,
	height: 150,
	text: 'This is a text box',
	colorKey: 'surface',
});
```

### Full Configuration Options

```typescript
type TextBoxArgs = {
	// Position and Size
	x?: number; // Optional X position
	y: number; // Y position
	width: number; // Box width
	height: number; // Box height

	// Content
	text: string; // Text content

	// Styling
	colorKey: string; // Theme color key for background
	fontColorKey?: string; // Theme color key for text
	fontFamily?: string; // Font family
	fontSize?: number; // Initial font size
	fontWeight?: number; // Font weight

	// Layout
	padding?: number; // Inner padding (default: 12)
	minFontSize?: number; // Minimum font size (default: 12)
	verticalAlign?: 'middle' | 'top' | 'bottom'; // Vertical alignment (default: 'middle')
};
```

### Text Box Behaviors

- **Word Wrapping**: Automatically wraps words to fit width
- **Text Fitting**: Shrinks text if needed while maintaining readability
- **Vertical Alignment**: Three modes:
  - `middle`: Centers text vertically (default)
  - `top`: Aligns text to top with padding
  - `bottom`: Aligns text to bottom with padding
- **Ellipsis**: Truncates with "..." if text overflows
- **Shadow**: Subtle drop shadow for depth

## Element Updates

The factory provides two utility functions for updating existing elements:

### Updating Text Content

```typescript
// Update text while maintaining layout and fitting
setElementText(buttonOrTextBox, 'New text content');
```

### Resizing Elements

```typescript
// Resize while maintaining text fitting and alignment
resizeElement(buttonOrTextBox, newWidth, newHeight);
```

Both utilities automatically:

- Recalculate text fitting
- Maintain alignment settings
- Preserve interaction behaviors
- Update overflow warnings if needed

## Common Use Cases

### Simple Button with Click Handler

```typescript
const playButton = createButton({
	y: 300,
	width: 180,
	height: 50,
	text: 'Play Game',
	colorKey: 'primary',
	onClick: () => startGame(),
});
```

### Styled Button with Custom Hover

```typescript
const dangerButton = createButton({
	y: 400,
	width: 160,
	height: 45,
	text: 'Delete Save',
	colorKey: 'danger',
	hoverColorKey: 'dangerHover',
	fontWeight: 700,
	onClick: () => confirmDelete(),
});
```

### Multiline Text Box

```typescript
const description = createTextBox({
	y: 200,
	width: 400,
	height: 200,
	text: 'This is a longer description that will automatically wrap to multiple lines while maintaining proper alignment and text fitting.',
	colorKey: 'surface',
	padding: 16,
	verticalAlign: 'top',
});
```

### Score Display with Bottom Alignment

```typescript
const scoreBox = createTextBox({
	y: 50,
	width: 120,
	height: 80,
	text: 'Score: 0',
	colorKey: 'accent',
	fontWeight: 700,
	fontSize: 24,
	verticalAlign: 'bottom',
});

// Later update the score
setElementText(scoreBox, `Score: ${newScore}`);
```

## Theme Integration

All elements use the default theme unless a custom theme is provided. Colors are referenced by key:

- Common color keys: `"primary"`, `"surface"`, `"accent"`, `"danger"`
- Text colors default to white for buttons and theme's `textColorKey` for text boxes
- Font settings (family, size, weight) default to theme values if not specified

## Best Practices

1. **Size Management**:
   - Provide adequate width for button text
   - Use minFontSize to ensure readability
   - Monitor console for overflow warnings

2. **Theme Usage**:
   - Use theme color keys for consistency
   - Consider hover states for interactive elements
   - Follow font weight conventions (400 normal, 500 medium, 700 bold)

3. **Performance**:
   - Cache elements that will be updated frequently
   - Use resizeElement instead of recreating elements
   - Batch updates when possible
