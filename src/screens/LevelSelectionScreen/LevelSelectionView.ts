// src/screens/level-selection/LevelSelectionView.ts

import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { createButton } from '../../ui';
import { preloadImage } from '../../core/utils/AssetLoader';

let LS_FONT = 16;
let LS_HEIGHT = 60;
let LS_WIDTH = 110;

/**
 * LevelSelectionView - Renders the level selection screen
 */
export class LevelSelectionView implements View {
	private group: Konva.Group;
	private buttonGroup?: Konva.Group;
	private starsToggleBtn?: Konva.Group;

	// ⭐ keep references so we can lock/unlock later
	private asteroidBtn!: Konva.Group;
	private marsBtn!: Konva.Group;
	private earthBtn!: Konva.Group;
	private mercuryBtn!: Konva.Group;
	private venusBtn!: Konva.Group;

	constructor(
		astroidBtnClick: () => void,
		marsBtnClick: () => void,
		earthBtnClick: () => void,
		mercuryBtnClick: () => void,
		venusBtnClick: () => void,
		onCheckProgressClick: () => void
	) {
		this.group = new Konva.Group({
			visible: true,
			id: 'levelSelectionScreen',
		});

		//-------------------------------------------------------
		// Background
		//-------------------------------------------------------
		const background = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			listening: false,
			image: new Image(),
		});

		void preloadImage('/assets/ui/LevelSelectBG.png').then((img) => {
			background.image(img);
			this.group.getLayer()?.batchDraw();
		});

		this.group.add(background);

		// -------------------------------------------------------
		// CHECK PROGRESS BUTTON (bottom-right corner)
		// -------------------------------------------------------
		const progressBtn = createButton({
			x: STAGE_WIDTH - 360,
			y: STAGE_HEIGHT - 90,
			width: 320,
			height: 60,
			text: 'CHECK PROGRESS',
			colorKey: 'accent_blue',
			hoverColorKey: 'accent_blue_hover',
			onClick: onCheckProgressClick,
		});

		this.group.add(progressBtn);

		//-------------------------------------------------------
		// SPECIAL EFFECTS FOR PROGRESS BUTTON
		//-------------------------------------------------------
		const pulse = () => {
			progressBtn.to({
				scaleX: 1.07,
				scaleY: 1.07,
				duration: 0.6,
				easing: Konva.Easings.EaseInOut,
				onFinish: () => {
					progressBtn.to({
						scaleX: 1,
						scaleY: 1,
						duration: 0.6,
						easing: Konva.Easings.EaseInOut,
						onFinish: pulse,
					});
				},
			});
		};
		pulse();

		progressBtn.on('mouseenter', () => {
			progressBtn.to({
				scaleX: 1.12,
				scaleY: 1.12,
				shadowBlur: 25,
				duration: 0.15,
			});
		});
		progressBtn.on('mouseleave', () => {
			progressBtn.to({
				scaleX: 1,
				scaleY: 1,
				shadowBlur: 15,
				duration: 0.15,
			});
		});
		progressBtn.on('mousedown', () => {
			progressBtn.to({
				scaleX: 0.92,
				scaleY: 0.92,
				duration: 0.1,
			});
		});
		progressBtn.on('mouseup', () => {
			progressBtn.to({
				scaleX: 1.12,
				scaleY: 1.12,
				duration: 0.1,
			});
		});

		//-------------------------------------------------------
		// SHOOTING STARS TOGGLE (bottom-left)
		//-------------------------------------------------------
		const starsToggleBtn = createButton({
			x: 40,
			y: STAGE_HEIGHT - 90,
			width: 260,
			height: 60,
			text: 'STARS: ON',
			colorKey: 'primary',
			hoverColorKey: 'primary_hover',
			onClick: () => undefined, // replaced by controller
		});
		this.starsToggleBtn = starsToggleBtn;
		this.group.add(starsToggleBtn);

		//-------------------------------------------------------
		// Button container
		//-------------------------------------------------------
		const buttonGroup = new Konva.Group({ listening: true });

		const baseX = STAGE_WIDTH / 2 - 200;
		let y = 350;

		const astroidBtn = createButton({
			x: baseX + 480,
			y: y - 70,
			fontSize: LS_FONT,
			width: LS_WIDTH,
			height: LS_HEIGHT,
			text: 'ASTEROID',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: astroidBtnClick,
		});

		const marsBtn = createButton({
			x: baseX + 355,
			y: y - 20,
			width: LS_WIDTH,
			height: LS_HEIGHT,
			text: 'MARS',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			fontSize: LS_FONT,
			onClick: marsBtnClick,
		});

		const earthBtn = createButton({
			x: baseX + 200,
			y: y + 45,
			width: LS_WIDTH,
			height: LS_HEIGHT,
			text: 'EARTH',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			fontSize: LS_FONT,
			onClick: earthBtnClick,
		});

		const mercuryBtn = createButton({
			x: 150,
			y: y + 200,
			width: LS_WIDTH,
			height: LS_HEIGHT,
			text: 'MERCURY',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			fontSize: LS_FONT,
			onClick: mercuryBtnClick,
		});

		const venusBtn = createButton({
			x: baseX - 20,
			y: y + 130,
			width: LS_WIDTH,
			height: LS_HEIGHT,
			text: 'VENUS',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			fontSize: LS_FONT,
			onClick: venusBtnClick,
		});

		buttonGroup.add(astroidBtn);
		buttonGroup.add(marsBtn);
		buttonGroup.add(earthBtn);
		buttonGroup.add(mercuryBtn);
		buttonGroup.add(venusBtn);

		// ⭐ store references
		this.buttonGroup = buttonGroup;
		this.asteroidBtn = astroidBtn;
		this.marsBtn = marsBtn;
		this.earthBtn = earthBtn;
		this.mercuryBtn = mercuryBtn;
		this.venusBtn = venusBtn;

		this.group.add(buttonGroup);
	}

	//-------------------------------------------------------
	// View Methods
	//-------------------------------------------------------
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.draw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.draw();
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	ensureButtonsOnTop(): void {
		if (this.buttonGroup) {
			this.buttonGroup.moveToTop();
		}
		// Keep toggles/progress above background effects.
		this.starsToggleBtn?.moveToTop();
	}

	//-------------------------------------------------------
	// NEW: lock / unlock visuals
	//-------------------------------------------------------
	/**
	 * Update which planets appear locked/unlocked based on DB.
	 * @param unlockedPlanets list of planet_ids that are unlocked (1..5)
	 */
	setLockState(unlockedPlanets: number[]): void {
		const set = new Set(unlockedPlanets);

		// Small helper: dim + disable when locked
		const setLocked = (btn: Konva.Group | undefined, locked: boolean) => {
			if (!btn) return;
			btn.listening(!locked);
			btn.opacity(locked ? 0.4 : 1.0);
		};

		// 1 Mercury, 2 Venus, 3 Earth, 4 Mars, 5 asteroidField

		// Mercury: always playable as first planet
		setLocked(this.mercuryBtn, false);

		// Venus locked unless 2 is in the unlocked list
		setLocked(this.venusBtn, !set.has(2));

		// Earth
		setLocked(this.earthBtn, !set.has(3));

		// Mars
		setLocked(this.marsBtn, !set.has(4));

		// Asteroid field
		setLocked(this.asteroidBtn, !set.has(5));

		this.group.getLayer()?.batchDraw();
	}

	setStarsToggleHandler(handler: () => void): void {
		this.starsToggleBtn?.off('click');
		this.starsToggleBtn?.on('click', handler);
	}

	setStarsToggleLabel(enabled: boolean): void {
		if (!this.starsToggleBtn) return;
		const label = enabled ? 'STARS: ON' : 'STARS: OFF';
		const txt = this.starsToggleBtn.findOne<Konva.Text>('Text');
		if (txt) txt.text(label);
		this.group.getLayer()?.batchDraw();
	}
}
