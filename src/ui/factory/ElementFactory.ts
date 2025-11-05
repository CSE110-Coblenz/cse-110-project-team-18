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
	minFontSize?: number; // floor when shrinking (default 12)
};

export type TextBoxArgs = BaseArgs & {
	padding?: number;
	minFontSize?: number; // floor when shrinking (default 12)
};

const H_PAD = 24; // 12px each side for buttons

// ---------- Metrics helpers ----------
function fitTextToWidth(
	t: Konva.Text,
	maxWidth: number,
	minSize = 12
): { fit: boolean; finalFontSize: number; measuredWidth: number } {
	t.width(Math.max(0, maxWidth));
	t.ellipsis(false);
	t.wrap('none');

	const textWidth = () => {
		const anyT = t as any;
		if (typeof anyT.textWidth === 'number' && anyT.textWidth > 0) return anyT.textWidth;
		const cr = t.getClientRect({ skipShadow: true, skipStroke: true });
		return cr.width;
	};

	while (textWidth() > maxWidth && t.fontSize() > minSize) {
		t.fontSize(t.fontSize() - 1);
		(t as any)._partialText = ''; // force metrics recompute
	}

	const fits = textWidth() <= maxWidth;
	if (!fits) t.ellipsis(true);

	return { fit: fits, finalFontSize: t.fontSize(), measuredWidth: textWidth() };
}

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
		width: Math.max(0, args.width - H_PAD),
		align: 'center',
		fontFamily: args.fontFamily ?? t.fontFamilyDefault,
		fontSize: args.fontSize ?? t.fontSizeDefault,
		fontStyle: weightToFontStyle(args.fontWeight ?? t.fontWeightDefault),
		fill: args.fontColorKey ? t.get(args.fontColorKey) : '#FFFFFF',
		listening: false,
	});

	// Horizontal fit (fixed button width)
	const { fit } = fitTextToWidth(txt, args.width - H_PAD, args.minFontSize ?? 12);
	txt.x(H_PAD / 2);

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

	// Overflow flag + warn (dev feedback, no layout changes)
	g.setAttr('_overflow', !fit);
	if (!fit) {
		// eslint-disable-next-line no-console
		console.warn(
			`[UI] Button text overflow: "${args.text}" (w=${args.width}px). ` +
				`Increase width, shorten text, or lower fontSize.`
		);
	}

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
	const txt = new Konva.Text({
		text: args.text,
		x: padding,
		y: padding,
		width: Math.max(0, args.width - padding * 2),
		height: Math.max(0, args.height - padding * 2),
		align: 'center', // horizontally centered
		wrap: 'word',
		ellipsis: true, // clip if needed (no auto-resize)
		fontFamily: args.fontFamily ?? t.fontFamilyDefault,
		fontSize: args.fontSize ?? Math.max(16, (t.fontSizeDefault ?? 24) - 2),
		fontStyle: weightToFontStyle(args.fontWeight ?? 500),
		fill: args.fontColorKey ? t.get(args.fontColorKey) : t.get(t.textColorKey),
		listening: false,
	});

	// Optional: shrink to min font size before ellipsis for text boxes too
	const usable = Math.max(0, args.width - padding * 2);
	fitTextToWidth(txt, usable, args.minFontSize ?? 12);
	// keep top-centered (y already = padding)

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
		// button: fixed width, re-fit and re-center vertically
		const { fit } = fitTextToWidth(txt, rect.width() - H_PAD, 12);
		txt.x(H_PAD / 2);
		const th = measuredTextHeight(txt);
		txt.height(th);
		txt.y(Math.round((rect.height() - th) / 2));
		group.setAttr('_overflow', !fit);
		if (!fit)
			console.warn(`[UI] Button text overflow after update: "${newText}" (w=${rect.width()}px).`);
	} else {
		// textbox: fixed box, re-fit (top-centered)
		const pad = txt.x?.() ?? 12;
		const usable = Math.max(0, rect.width() - pad * 2);
		fitTextToWidth(txt, usable, 12);
	}
}

export function resizeElement(group: Konva.Group, width: number, height: number) {
	const rect = group.findOne<Konva.Rect>('Rect');
	const txt = group.findOne<Konva.Text>('Text');
	if (!rect || !txt) return;

	rect.width(width);
	rect.height(height);

	if (group.listening()) {
		// button
		const { fit } = fitTextToWidth(txt, width - H_PAD, 12);
		txt.x(H_PAD / 2);
		const th = measuredTextHeight(txt);
		txt.height(th);
		txt.y(Math.round((height - th) / 2));
		group.setAttr('_overflow', !fit);
		if (!fit)
			console.warn(`[UI] Button text overflow after resize (w=${width}px, text="${txt.text()}").`);
	} else {
		// textbox
		const pad = txt.x?.() ?? 12;
		const usable = Math.max(0, width - pad * 2);
		fitTextToWidth(txt, usable, 12);
	}
}

// For tests / debug panels
export function hasOverflow(group: Konva.Group): boolean {
	return !!group.getAttr('_overflow');
}
