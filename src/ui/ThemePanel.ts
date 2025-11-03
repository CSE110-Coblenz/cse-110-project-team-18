import Konva from 'konva';
import ThemeManager from '../core/ThemeManager';
import type { Theme } from '../config/theme';

/**
 * Small floating panel for toggling theme values during development
 */
export class ThemePanel {
  private group: Konva.Group;
  private unsubscribeTheme?: () => void;

  constructor() {
    const theme = ThemeManager.getTheme();
    this.group = new Konva.Group({
      x: 10,
      y: 10,
      visible: true,
      opacity: 0.9,
    });

    // Panel background
    const bg = new Konva.Rect({
      width: 200,
      height: 280,
      fill: theme.colors.panel,
      cornerRadius: 8,
      shadowColor: 'black',
      shadowBlur: 10,
      shadowOffset: { x: 0, y: 2 },
      shadowOpacity: 0.3,
    });

    // Title
    const title = new Konva.Text({
      x: 10,
      y: 10,
      text: 'Theme Tester',
      fontSize: theme.typography.sizeBase,
      fontFamily: theme.typography.fontFamily,
      fill: theme.colors.textPrimary,
    });

    // Create theme toggle buttons
    const themes: Record<string, Partial<Theme>> = {
      'Light': {
        colors: {
          ...theme.colors,
          primary: '#3b82f6',
          primaryDark: '#2563eb',
          background: '#f8fafc',
          panel: '#ffffff',
          textPrimary: '#0f172a',
          textSecondary: '#475569',
        }
      },
      'Dark': {
        colors: {
          ...theme.colors,
          primary: '#2ecc71',
          primaryDark: '#27ae60',
          background: '#0b1020',
          panel: '#111827',
          textPrimary: '#ffffff',
          textSecondary: '#cbd5e1',
        }
      },
      'Fun': {
        colors: {
          ...theme.colors,
          primary: '#f472b6',
          primaryDark: '#db2777',
          accent: '#a855f7',
          background: '#581c87',
          panel: '#701a75',
          textPrimary: '#fdf4ff',
          textSecondary: '#e9d5ff',
        }
      }
    };

    // Create buttons for each theme
    let y = 50;
    Object.entries(themes).forEach(([name, themeOverride]) => {
      const buttonGroup = new Konva.Group({ y });

      const button = new Konva.Rect({
        x: 10,
        width: 180,
        height: 40,
        fill: theme.colors.primary,
        cornerRadius: 6,
      });

      const text = new Konva.Text({
        x: 20,
        y: 10,
        text: name,
        fontSize: theme.typography.sizeBase,
        fontFamily: theme.typography.fontFamily,
        fill: theme.colors.textPrimary,
      });

      buttonGroup.add(button, text);
      buttonGroup.on('click', () => {
        const currentTheme = ThemeManager.getTheme();
        ThemeManager.setTheme({
          ...currentTheme,
          ...themeOverride
        });
      });

      this.group.add(buttonGroup);
      y += 60;
    });

    // Add all shapes
    this.group.add(bg, title);

    // Subscribe to theme changes
    this.unsubscribeTheme = ThemeManager.subscribe(() => {
      const t = ThemeManager.getTheme();
      bg.fill(t.colors.panel);
      title.fill(t.colors.textPrimary);
      title.fontSize(t.typography.sizeBase);
      title.fontFamily(t.typography.fontFamily);

      // Update all button styles
      this.group.find('Rect').forEach(rect => {
        if (rect !== bg) {
          (rect as Konva.Rect).fill(t.colors.primary);
        }
      });
      this.group.find('Text').forEach(node => {
        if (node !== title) {
          const text = node as Konva.Text;
          text.fill(t.colors.textPrimary);
          text.fontSize(t.typography.sizeBase);
          text.fontFamily(t.typography.fontFamily);
        }
      });

      this.group.getLayer()?.draw();
    });
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

  destroy(): void {
    if (this.unsubscribeTheme) this.unsubscribeTheme();
  }
}