import defaultTheme, { Theme } from '../config/theme';
import { applyThemeToRoot } from '../utils/themeHelpers';

type Listener = () => void;

class ThemeManager {
  private theme: Theme;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.theme = defaultTheme;
    // Apply initial theme to DOM if available
    if (typeof document !== 'undefined') {
      applyThemeToRoot(this.theme);
      // expose for quick debugging in browser console
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).ThemeManager = this;
      } catch (e) {
        // ignore
      }
    }
  }

  getTheme(): Theme {
    return JSON.parse(JSON.stringify(this.theme));
  }

  setTheme(newTheme: Theme) {
    this.theme = newTheme;
    this._notify();
  }

  updateToken(path: string[], value: any) {
    // shallow safe set following path
    let target: any = this.theme as any;
    for (let i = 0; i < path.length - 1; i++) {
      const p = path[i];
      if (!(p in target)) target[p] = {};
      target = target[p];
    }
    target[path[path.length - 1]] = value;
    this._notify();
  }

  subscribe(cb: Listener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private _notify() {
    if (typeof document !== 'undefined') applyThemeToRoot(this.theme);
    for (const cb of Array.from(this.listeners)) {
      try {
        cb();
      } catch (e) {
        // swallow listener errors to avoid breaking other listeners
        // eslint-disable-next-line no-console
        console.error('Theme listener error', e);
      }
    }
  }

  applyToRoot() {
    if (typeof document !== 'undefined') applyThemeToRoot(this.theme);
  }
}

const instance = new ThemeManager();
export default instance;
