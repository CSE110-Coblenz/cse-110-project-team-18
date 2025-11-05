/*
  Put the Theme class + setStageWidth, and the invariants here (corner radius, stroke width). 
  Export Theme, setStageWidth, and a setDefaultTheme/getDefaultTheme.
*/
import Konva from 'konva';
// import { STAGE_WIDTH } from '../../configs/GameConfig';

let STAGE_WIDTH = 1500;

export function setStageWidth(w: number) {
	STAGE_WIDTH = w;
}
export function getDefaultX(): number {
	return STAGE_WIDTH / 2 - 200;
}

export const CORNER_RADIUS = 10;
export const STROKE_WIDTH = 2;
export const BUTTON_LISTENING = true;
export const TEXTBOX_LISTENING = false;

export type ThemeInit = {
	colors: Record<string, string>;
	fontFamilyDefault?: string;
	fontSizeDefault?: number;
	fontWeightDefault?: number;
	strokeColorKey?: string;
	textColorKey?: string;
};

export class Theme {
	private _colors = new Map<string, string>();
	readonly fontFamilyDefault: string;
	readonly fontSizeDefault: number;
	readonly fontWeightDefault: number;
	readonly strokeColorKey: string;
	readonly textColorKey: string;
	constructor(init: ThemeInit) {
		Object.entries(init.colors ?? {}).forEach(([k, v]) => this._colors.set(k, v));
		this.fontFamilyDefault = init.fontFamilyDefault ?? 'Inter, system-ui, -apple-system, Roboto';
		this.fontSizeDefault = init.fontSizeDefault ?? 24;
		this.fontWeightDefault = init.fontWeightDefault ?? 600;
		this.strokeColorKey = init.strokeColorKey ?? 'stroke';
		this.textColorKey = init.textColorKey ?? 'text_primary';
	}
	get(key: string): string {
		const v = this._colors.get(key);
		if (!v) throw new Error(`Theme color '${key}' not found`);
		return v;
	}
	has(key: string) {
		return this._colors.has(key);
	}
}

let __defaultTheme: Theme | null = null;
export function setDefaultTheme(t: Theme) {
	__defaultTheme = t;
}
export function getDefaultTheme(): Theme {
	if (!__defaultTheme) throw new Error('Default Theme not set. Call setDefaultTheme(...) at boot.');
	return __defaultTheme;
}

// small helpers used by the factory
export function lighten(hex: string, amount = 0.1): string {
	const h = hex.replace('#', '');
	const n = parseInt(
		h.length === 3
			? h
					.split('')
					.map((c) => c + c)
					.join('')
			: h,
		16
	);
	let r = (n >> 16) & 255,
		g = (n >> 8) & 255,
		b = n & 255;
	r = Math.min(255, Math.round(r + 255 * amount));
	g = Math.min(255, Math.round(g + 255 * amount));
	b = Math.min(255, Math.round(b + 255 * amount));
	return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
export function weightToFontStyle(weight?: number): 'normal' | 'bold' {
	if (!weight) return 'normal';
	return weight >= 600 ? 'bold' : 'normal';
}
