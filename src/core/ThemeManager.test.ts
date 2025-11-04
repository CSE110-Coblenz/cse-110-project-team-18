// Declare test globals so TS compilation doesn't require @types/jest in this repo.
declare const describe: (name: string, fn: () => void) => void
declare const beforeEach: (fn: () => void) => void
declare const test: (name: string, fn: () => void) => void
declare const expect: any
declare const jest: any

import ThemeManager from './ThemeManager'
import defaultTheme from '../config/theme'

describe('ThemeManager', () => {
  beforeEach(() => {
    // reset to known state
    ThemeManager.setTheme(defaultTheme)
    // clear any CSS variables set on :root
    if (typeof document !== 'undefined' && document.documentElement) {
      const root = document.documentElement
      const props = Array.from(root.style).filter((p) => p.startsWith('--theme-'))
      for (const p of props) root.style.removeProperty(p)
    }
  })

  test('getTheme returns a deep copy (mutating returned object does not change manager state)', () => {
    const t1 = ThemeManager.getTheme()
    // mutate nested value
    ;(t1.colors as any).primary = 'x'

    const t2 = ThemeManager.getTheme()
    expect(t2.colors.primary).not.toBe('x')
  })

  test('setTheme applies CSS variables to document.documentElement.style', () => {
    const newTheme = JSON.parse(JSON.stringify(defaultTheme))
    newTheme.colors.primary = '#123456'

    ThemeManager.setTheme(newTheme)

    if (typeof document === 'undefined' || !document.documentElement) {
      // In non-DOM environment, just pass
      return
    }

    const val = document.documentElement.style.getPropertyValue('--theme-colors-primary')
    expect(val).toBe(newTheme.colors.primary)
  })

  test('subscribe and unsubscribe notify listeners appropriately', () => {
    const cb = jest.fn()
    const unsub = ThemeManager.subscribe(cb)

    const next = JSON.parse(JSON.stringify(defaultTheme))
    next.colors.primary = '#abcdef'
    ThemeManager.setTheme(next)

    expect(cb).toHaveBeenCalledTimes(1)
    // ensure listener received the theme object
    expect(cb.mock.calls[0][0].colors.primary).toBe('#abcdef')

    unsub()
    ThemeManager.setTheme(defaultTheme)
    expect(cb).toHaveBeenCalledTimes(1)
  })
})
