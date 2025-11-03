import type { Theme } from '../config/theme';

function flattenTheme(obj: any, path: string[] = [], out: Record<string, string> = {}) {
  if (obj == null) return out;
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    const key = `--theme-${path.join('-')}`;
    out[key] = String(obj);
    return out;
  }
  for (const k of Object.keys(obj)) {
    flattenTheme(obj[k], path.concat(k), out);
  }
  return out;
}

export function applyThemeToRoot(theme: Theme) {
  if (typeof document === 'undefined' || !document.documentElement) return;
  const vars = flattenTheme(theme as any);
  const root = document.documentElement;
  Object.keys(vars).forEach((k) => {
    root.style.setProperty(k, vars[k]);
  });
}

export function cssVar(namePath: string[]) {
  return `var(--theme-${namePath.join('-')})`;
}
