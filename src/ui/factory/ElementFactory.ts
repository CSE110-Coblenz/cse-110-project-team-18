// src/ui/factory/ElementFactory.ts
import Konva from 'konva';
import {
	Theme,
	getDefaultTheme,
	weightToFontStyle,
	lighten,
	CORNER_RADIUS,
	STROKE_WIDTH,
	BUTTON_LISTENING,
	TEXTBOX_LISTENING,
	getDefaultX,
} from '../theme/Theme';

// ---------- Types ----------
export type BaseArgs = {
	x?: number;
	y: number;
	width: number;
	height: number;
	text: string;
	colorKey: string;
	fontColorKey?: string;
	fontFamily?: string;
	fontSize?: number;
	fontWeight?: number;
};

export type ButtonArgs = BaseArgs & {
	onClick?: () => void;
	hoverColorKey?: string;
	// kept for API compatibility but unused now
	minFontSize?: number;
};

export type TextBoxArgs = BaseArgs & {
	padding?: number;
	minFontSize?: number; // unused now, but kept for compat
	// vertical alignment mode (horizontal is always centered)
	verticalAlign?: 'middle' | 'top' | 'bottom';
};

const H_PAD = 24; // buttons: 12px left + 12px right

// ---------- Metrics helpers ----------
function measuredTextHeight(t: Konva.Text): number {
	const anyT = t as any;
	if (typeof anyT.textHeight === 'number' && anyT.textHeight > 0) return anyT.textHeight;
	const cr = t.getClientRect({ skipShadow: true, skipStroke: true });
	if (cr && cr.height > 0) return cr.height;
	return t.fontSize() * (t.lineHeight?.() ?? 1);
}

// ---------- Factories ----------
export function createButton(args: ButtonArgs, theme?: Theme): Konva.Group {
	const t = theme ?? getDefaultTheme();
	const x = args.x ?? getDefaultX();
	const g = new Konva.Group({ x, y: args.y, listening: BUTTON_LISTENING });

	g.name('mt-btn');
	const fill = t.get(args.colorKey);
	const hoverFill =
		args.hoverColorKey && t.has(args.hoverColorKey) ? t.get(args.hoverColorKey) : lighten(fill);
	const stroke = t.has(t.strokeColorKey) ? t.get(t.strokeColorKey) : '#111827';

	const rect = new Konva.Rect({
		width: args.width,
		height: args.height,
		fill,
		cornerRadius: CORNER_RADIUS,
		stroke,
		strokeWidth: STROKE_WIDTH,
		shadowColor: 'rgba(0,0,0,0.35)',
		shadowBlur: 12,
		shadowOffsetY: 3,
	});

	const txt = new Konva.Text({
		text: args.text,
		x: H_PAD / 2,
		y: 0, // we'll vertically center after measuring
		width: Math.max(0, args.width - H_PAD),
		align: 'center', // Konva horizontally centers within this width
		wrap: 'none',
		ellipsis: false,
		fontFamily: args.fontFamily ?? t.fontFamilyDefault,
		fontSize: args.fontSize ?? t.fontSizeDefault,
		fontStyle: weightToFontStyle(args.fontWeight ?? t.fontWeightDefault),
		fill: args.fontColorKey ? t.get(args.fontColorKey) : '#FFFFFF',
		listening: false,
	});

	// Vertical centering using measured glyph height
	const th = measuredTextHeight(txt);
	txt.height(th);
	txt.y(Math.round((args.height - th) / 2));

	// Interactions
	g.on('mouseenter', () => {
		(g.getStage()?.container() as HTMLElement).style.cursor = 'pointer';
		rect.fill(hoverFill);
	});
	g.on('mouseleave', () => {
		(g.getStage()?.container() as HTMLElement).style.cursor = 'default';
		rect.fill(fill);
	});
	if (args.onClick) g.on('click tap', args.onClick);

	// No overflow logic anymore
	g.setAttr('_overflow', false);

	g.add(rect);
	g.add(txt);
	return g;
}

export function createTextBox(args: TextBoxArgs, theme?: Theme): Konva.Group {
	const t = theme ?? getDefaultTheme();
	const x = args.x ?? getDefaultX();
	const g = new Konva.Group({ x, y: args.y, listening: TEXTBOX_LISTENING });

	const rect = new Konva.Rect({
		width: args.width,
		height: args.height,
		fill: t.get(args.colorKey),
		cornerRadius: CORNER_RADIUS,
		stroke: t.get(t.strokeColorKey),
		strokeWidth: STROKE_WIDTH,
		shadowColor: 'rgba(0,0,0,0.15)',
		shadowBlur: 8,
		shadowOffsetY: 2,
	});

	const padding = args.padding ?? 12;
	const vAlign: 'middle' | 'top' | 'bottom' = args.verticalAlign ?? 'middle';

	const txt = new Konva.Text({
		text: args.text,
		x: padding,
		// y will be decided after measuring text height
		width: Math.max(0, args.width - padding * 2),
		height: Math.max(0, args.height - padding * 2),
		align: 'center', // horizontal center
		wrap: 'word',
		ellipsis: true, // will clip if needed
		fontFamily: args.fontFamily ?? t.fontFamilyDefault,
		fontSize: args.fontSize ?? Math.max(16, (t.fontSizeDefault ?? 24) - 2),
		fontStyle: weightToFontStyle(args.fontWeight ?? 500),
		fill: args.fontColorKey ? t.get(args.fontColorKey) : t.get(t.textColorKey),
		listening: false,
	});

	// Vertical align (middle default)
	const th = measuredTextHeight(txt);
	let yText = padding;
	if (vAlign === 'middle') {
		yText = Math.max(padding, Math.round((args.height - th) / 2));
	} else if (vAlign === 'bottom') {
		yText = Math.max(padding, args.height - padding - th);
	} else {
		yText = padding; // 'top'
	}
	txt.y(yText);

	// persist attrs for updates (for resize / text changes)
	g.setAttr('_pad', padding);
	g.setAttr('_vAlign', vAlign);
	g.setAttr('_overflow', false);

	g.add(rect);
	g.add(txt);
	return g;
}

// ---------- Utilities ----------
export function setElementText(group: Konva.Group, newText: string) {
	const txt = group.findOne<Konva.Text>('Text');
	const rect = group.findOne<Konva.Rect>('Rect');
	if (!txt || !rect) return;

	txt.text(newText);

	if (group.listening()) {
		// button: keep fixed width and center horizontally via Konva
		txt.x(H_PAD / 2);
		txt.width(Math.max(0, rect.width() - H_PAD));
		txt.align('center');

		const th = measuredTextHeight(txt);
		txt.height(th);
		txt.y(Math.round((rect.height() - th) / 2));

		group.setAttr('_overflow', false);
	} else {
		// textbox: fixed box, just recalc vertical align
		const pad = (group.getAttr('_pad') as number) ?? 12;
		const vAlign = (group.getAttr('_vAlign') as 'middle' | 'top' | 'bottom') ?? 'middle';

		const th = measuredTextHeight(txt);
		let yText = pad;
		if (vAlign === 'middle') {
			yText = Math.max(pad, Math.round((rect.height() - th) / 2));
		} else if (vAlign === 'bottom') {
			yText = Math.max(pad, rect.height() - pad - th);
		} else {
			yText = pad;
		}
		txt.x(pad);
		txt.y(yText);

		group.setAttr('_overflow', false);
	}
}

export function resizeElement(group: Konva.Group, width: number, height: number) {
	const rect = group.findOne<Konva.Rect>('Rect');
	const txt = group.findOne<Konva.Text>('Text');
	if (!rect || !txt) return;

	rect.width(width);
	rect.height(height);

	if (group.listening()) {
		// button: keep same font, re-center
		txt.width(Math.max(0, width - H_PAD));
		txt.x(H_PAD / 2);
		txt.align('center');

		const th = measuredTextHeight(txt);
		txt.height(th);
		txt.y(Math.round((height - th) / 2));

		group.setAttr('_overflow', false);
	} else {
		// textbox: keep same font, re-do vertical alignment
		const pad = (group.getAttr('_pad') as number) ?? 12;
		const vAlign = (group.getAttr('_vAlign') as 'middle' | 'top' | 'bottom') ?? 'middle';
		txt.width(Math.max(0, width - pad * 2));

		const th = measuredTextHeight(txt);
		let yText = pad;
		if (vAlign === 'middle') {
			yText = Math.max(pad, Math.round((height - th) / 2));
		} else if (vAlign === 'bottom') {
			yText = Math.max(pad, height - pad - th);
		} else {
			yText = pad;
		}
		txt.x(pad);
		txt.y(yText);

		group.setAttr('_overflow', false);
	}
}

// For tests / debug panels
export function hasOverflow(group: Konva.Group): boolean {
	return !!group.getAttr('_overflow');
}