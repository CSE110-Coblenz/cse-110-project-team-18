export type Theme = {
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    background: string;
    panel: string;
    textPrimary: string;
    textSecondary: string;
  };
  typography: {
    fontFamily: string;
    sizeLarge: number;
    sizeBase: number;
    sizeSmall: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    small: string;
    medium: string;
  };
};

export const defaultTheme: Theme = {
  colors: {
    primary: '#2ecc71',
    primaryDark: '#27ae60',
    accent: '#f39c12',
    background: '#0b1020',
    panel: '#111827',
    textPrimary: '#ffffff',
    textSecondary: '#cbd5e1',
  },
  typography: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    sizeLarge: 48,
    sizeBase: 24,
    sizeSmall: 14,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  shadows: {
    small: '0 1px 2px rgba(0,0,0,0.2)',
    medium: '0 4px 8px rgba(0,0,0,0.3)',
  },
};

export default defaultTheme;
