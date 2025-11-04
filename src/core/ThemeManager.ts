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
    // return a deep copy so callers cannot mutate internal state
    try {
      // prefer structuredClone when available
      const sc = (globalThis as any).structuredClone
      return sc ? sc(this.current) : JSON.parse(JSON.stringify(this.current))
    } catch {
      return JSON.parse(JSON.stringify(this.current))
    }
  }

  setTheme(next: Theme): void {
    this.current = next
    applyThemeToRoot(this.current)
    for (const cb of Array.from(this.listeners)) {
      try {
        // give listeners a copy to avoid accidental mutation
        const payload = (() => {
          try {
            const sc = (globalThis as any).structuredClone
            return sc ? sc(this.current) : JSON.parse(JSON.stringify(this.current))
          } catch {
            return JSON.parse(JSON.stringify(this.current))
          }
        })()
        cb(payload)
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
