import ThemeManager from '../core/ThemeManager'
import defaultTheme from '../config/theme'

type Unmount = () => void

// Minimal floating dev widget to switch between light and dark presets.
export function mountThemePanel(container?: HTMLElement): Unmount {
  const host = container ?? (typeof document !== 'undefined' ? document.body : null)
  if (!host) return () => {}

  const panel = document.createElement('div')
  panel.setAttribute('data-theme-panel', 'true')
  Object.assign(panel.style, {
    position: 'fixed',
    right: '12px',
    bottom: '12px',
    padding: '8px',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    borderRadius: '6px',
    zIndex: '9999',
    fontFamily: 'system-ui, Arial, sans-serif',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    boxShadow: '0 6px 18px rgba(0,0,0,0.5)'
  })

  const makeBtn = (label: string) => {
    const b = document.createElement('button')
    b.textContent = label
    Object.assign(b.style, {
      padding: '6px 10px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '13px'
    })
    return b
  }

  // create two simple presets
  const light: typeof defaultTheme = JSON.parse(JSON.stringify(defaultTheme))
  light.colors.background = '#f7fafc'
  light.colors.surface = '#ffffff'
  light.colors.text = '#0b1220'
  light.colors.textDim = '#475569'
  light.colors.primary = '#0b5fff'
  light.typography.fontFamily = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto"

  const dark: typeof defaultTheme = JSON.parse(JSON.stringify(defaultTheme))
  // keep dark as defaultTheme (already dark), but ensure values exist
  dark.colors.background = dark.colors.background || '#0f1722'

  const lightBtn = makeBtn('Light')
  const darkBtn = makeBtn('Dark')

  lightBtn.addEventListener('click', () => ThemeManager.setTheme(light))
  darkBtn.addEventListener('click', () => ThemeManager.setTheme(dark))

  panel.appendChild(lightBtn)
  panel.appendChild(darkBtn)
  host.appendChild(panel)

  return () => {
    try {
      panel.remove()
    } catch {}
  }
}

export default mountThemePanel
