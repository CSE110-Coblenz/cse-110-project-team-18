# Theme System QA Checklist

## Visual Consistency

### Colors
- [ ] Menu title uses theme.colors.textPrimary
- [ ] Start button uses theme.colors.primary for background
- [ ] Start button text uses theme.colors.textPrimary
- [ ] Theme panel background uses theme.colors.panel
- [ ] Theme panel buttons use theme.colors.primary
- [ ] All text colors are from theme (no hard-coded colors)

### Typography
- [ ] Menu title uses theme.typography.sizeLarge
- [ ] Start button text uses theme.typography.sizeBase
- [ ] Theme panel text uses theme.typography.sizeBase
- [ ] All text uses theme.typography.fontFamily
- [ ] No hard-coded font sizes or families

### Spacing
- [ ] Menu elements use theme spacing tokens
- [ ] Theme panel padding uses spacing tokens
- [ ] Button padding uses spacing tokens
- [ ] Consistent gaps between elements

## Theme Switching

### Dark Theme
- [ ] All text is readable on dark background
- [ ] Buttons are clearly visible
- [ ] Start button hover state is visible
- [ ] Panel has good contrast with background

### Light Theme
- [ ] All text is readable on light background
- [ ] Buttons maintain good contrast
- [ ] Start button hover state is visible
- [ ] Panel shadows are visible but subtle

### Fun Theme
- [ ] Text maintains readability despite vibrant colors
- [ ] UI elements have sufficient contrast
- [ ] Interactive elements are clearly distinguishable
- [ ] Overall theme feels cohesive

## Accessibility

### Color Contrast
- [ ] Text meets WCAG 2.1 AA contrast requirements in all themes
  - Primary text: 4.5:1 minimum
  - Large text: 3:1 minimum
- [ ] Interactive elements have sufficient contrast
- [ ] Error states remain visible in all themes

### Interactive Elements
- [ ] Buttons are clearly interactive in all themes
- [ ] Hover/focus states are visible
- [ ] Selected state is distinguishable
- [ ] Click targets are sufficiently large

## Performance

### Theme Switching
- [ ] Theme changes are immediate (no visible delay)
- [ ] No flickering during theme changes
- [ ] UI remains responsive during theme switch
- [ ] Multiple rapid theme changes don't cause issues

### Memory
- [ ] No memory leaks after many theme switches
- [ ] Performance remains stable
- [ ] No console errors during theme operations

## Edge Cases

### State Preservation
- [ ] Game state persists through theme changes
- [ ] UI position/layout maintained during theme switch
- [ ] Animations continue smoothly through theme changes

### Error Handling
- [ ] Invalid theme values don't crash the app
- [ ] Missing theme tokens fall back gracefully
- [ ] Theme manager error messages are helpful

## Browser Compatibility
- [ ] Theme works in Chrome
- [ ] Theme works in Firefox
- [ ] Theme works in Safari
- [ ] CSS variables are applied correctly

## Documentation
- [ ] All theme tokens are documented
- [ ] Usage examples are up to date
- [ ] API documentation is complete
- [ ] Change process is documented