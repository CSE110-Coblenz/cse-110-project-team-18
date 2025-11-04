import defaultTheme, { type Theme } from '../config/theme'
import { applyThemeToRoot } from '../utils/themeHelpers'

// Minimal singleton ThemeManager.
// API: getTheme(), setTheme(next), subscribe(cb): () => void
class ThemeManagerClass {
  private current: Theme
  private listeners: Set<(theme: Theme) => void> = new Set()

  constructor(initial?: Theme) {
    this.current = initial ?? defaultTheme
    // apply initial theme to :root
    applyThemeToRoot(this.current)
  }

  getTheme(): Theme {
    return this.current
  }

  setTheme(next: Theme): void {
    this.current = next
    applyThemeToRoot(this.current)
    for (const cb of Array.from(this.listeners)) {
      try {
        cb(this.current)
      } catch {
        // swallow listener errors to avoid breaking other listeners
      }
    }
  }

  subscribe(cb: (theme: Theme) => void): () => void {
    this.listeners.add(cb)
    return () => {
      this.listeners.delete(cb)
    }
  }
}

export const ThemeManager = new ThemeManagerClass()
export default ThemeManager
