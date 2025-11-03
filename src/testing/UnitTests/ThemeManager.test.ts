import ThemeManager from '../../core/ThemeManager';
import { Theme, defaultTheme } from '../../config/theme';

describe('ThemeManager', () => {
  beforeEach(() => {
    // Reset theme to default before each test
    ThemeManager.setTheme(defaultTheme);
    // Clear any existing subscriptions
    ThemeManager['listeners'].clear();
  });

  describe('getTheme', () => {
    it('should return the current theme', () => {
      expect(ThemeManager.getTheme()).toEqual(defaultTheme);
    });

    it('should return a copy of the theme to prevent direct mutation', () => {
      const theme = ThemeManager.getTheme();
      theme.colors.primary = '#ff0000';
      expect(ThemeManager.getTheme().colors.primary).not.toBe('#ff0000');
    });
  });

  describe('setTheme', () => {
    it('should update the entire theme', () => {
      const newTheme: Theme = {
        ...defaultTheme,
        colors: {
          ...defaultTheme.colors,
          primary: '#ff0000',
          accent: '#00ff00'
        }
      };

      ThemeManager.setTheme(newTheme);
      expect(ThemeManager.getTheme()).toEqual(newTheme);
    });

    it('should notify subscribers when theme changes', () => {
      const listener = jest.fn();
      ThemeManager.subscribe(listener);

      const newTheme = { ...defaultTheme };
      ThemeManager.setTheme(newTheme);

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateToken', () => {
    it('should update a specific theme token', () => {
      ThemeManager.updateToken(['colors', 'primary'], '#ff0000');
      expect(ThemeManager.getTheme().colors.primary).toBe('#ff0000');
    });

    it('should update nested tokens', () => {
      ThemeManager.updateToken(['typography', 'sizeLarge'], 64);
      expect(ThemeManager.getTheme().typography.sizeLarge).toBe(64);
    });

    it('should notify subscribers when token changes', () => {
      const listener = jest.fn();
      ThemeManager.subscribe(listener);

      ThemeManager.updateToken(['colors', 'primary'], '#ff0000');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribe/unsubscribe', () => {
    it('should add and remove subscribers', () => {
      const listener = jest.fn();
      const unsubscribe = ThemeManager.subscribe(listener);

      ThemeManager.updateToken(['colors', 'primary'], '#ff0000');
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      ThemeManager.updateToken(['colors', 'primary'], '#00ff00');
      expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called after unsubscribe
    });

    it('should handle multiple subscribers', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      ThemeManager.subscribe(listener1);
      ThemeManager.subscribe(listener2);

      ThemeManager.updateToken(['colors', 'primary'], '#ff0000');
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should not break if a subscriber throws an error', () => {
      const goodListener = jest.fn();
      const badListener = jest.fn().mockImplementation(() => {
        throw new Error('Subscriber error');
      });

      ThemeManager.subscribe(badListener);
      ThemeManager.subscribe(goodListener);

      // Should not throw and should call all subscribers
      expect(() => {
        ThemeManager.updateToken(['colors', 'primary'], '#ff0000');
      }).not.toThrow();

      expect(goodListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('DOM integration', () => {
    it('should apply theme to CSS variables when document is available', () => {
      // JSDOM provides a document
      ThemeManager.updateToken(['colors', 'primary'], '#ff0000');
      expect(document.documentElement.style.getPropertyValue('--theme-colors-primary')).toBe('#ff0000');
    });

    it('should update all relevant CSS variables when theme changes', () => {
      const newTheme: Theme = {
        ...defaultTheme,
        colors: {
          ...defaultTheme.colors,
          primary: '#ff0000',
          accent: '#00ff00'
        }
      };

      ThemeManager.setTheme(newTheme);
      expect(document.documentElement.style.getPropertyValue('--theme-colors-primary')).toBe('#ff0000');
      expect(document.documentElement.style.getPropertyValue('--theme-colors-accent')).toBe('#00ff00');
    });
  });
});