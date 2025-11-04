// Theme tokens for the application
// Plain object only — no runtime logic or external libs.

export type Theme = {
  colors: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    background: string
    surface: string
    muted: string
    border: string
    text: string
    textDim: string
    success: string
    warning: string
    error: string
    transparent: string
  }
  typography: {
    fontFamily: string
    // scale in rem units
    fontSize: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      '2xl': string
    }
    fontWeight: {
      regular: number
      medium: number
      bold: number
    }
    lineHeight: {
      normal: string
      relaxed: string
      compact: string
    }
  }
  spacing: {
    // spacing scale in rem units
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  shadows: {
    none: string
    sm: string
    md: string
    lg: string
    focus: string
  }
}

export const defaultTheme: Theme = {
  colors: {
    primary: '#0b5fff', // vivid blue
    primaryForeground: '#ffffff',
    secondary: '#6b7280', // neutral gray
    secondaryForeground: '#ffffff',
    background: '#0f1722', // dark background slightly off-black
    surface: '#111827', // slightly lighter than background for cards
    muted: '#9ca3af',
    border: '#1f2937',
    text: '#e6eef8',
    textDim: '#9aa6b2',
    success: '#16a34a',
    warning: '#f59e0b',
    error: '#ef4444',
    transparent: 'transparent',
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      normal: '1.5',
      relaxed: '1.75',
      compact: '1.25',
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(2,6,23,0.5)',
    md: '0 4px 12px rgba(2,6,23,0.6)',
    lg: '0 10px 30px rgba(2,6,23,0.65)',
    focus: '0 0 0 3px rgba(11,95,255,0.18)',
  },
}

export default defaultTheme
