import type { Theme } from '../config/theme'

// Flatten a Theme object and apply as CSS variables on :root.
// Variables are named like --theme-colors-primary, --theme-typography-fontSize-md, etc.
export function applyThemeToRoot(theme: Theme): void {
  if (typeof document === 'undefined' || !document.documentElement) return

  const root = document.documentElement

  function recurse(obj: unknown, path: string[]): void {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      for (const key of Object.keys(obj)) {
        const val = (obj as any)[key]
        recurse(val, path.concat(key))
      }
      return
    }

    const name = ['theme', ...path].join('-')
    const value = obj == null ? '' : String(obj)
    root.style.setProperty(`--${name}`, value)
  }

  recurse(theme as unknown, [])
}
