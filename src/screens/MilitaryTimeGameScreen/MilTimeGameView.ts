import Konva from 'konva';
import type { View } from '../../types';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { createButton } from '../../ui';
import { theme } from '../../configs/ThemeConfig';

export class MilitaryTimeGameView implements View {
	private group: Konva.Group;
	private onChoice: (choice: string) => void;
	private onMenu: () => void;

	constructor(onChoice: (choice: string) => void, onMenu: () => void) {
		this.group = new Konva.Group({ visible: false });
		this.onChoice = onChoice;
		this.onMenu = onMenu;
	}

	getGroup() {
		return this.group;
	}

	show() {
		this.group.visible(true);
		this.group.getLayer()?.batchDraw();
	}

	hide() {
		this.group.visible(false);
		this.group.destroyChildren(); // FULL WIPE
		this.group.getLayer()?.batchDraw();
	}

	clear() {
		this.group.destroyChildren();
	}

	disableAnswerButtons() {
		this.group.find('.mt-btn').forEach((btn) => {
			btn.listening(false);
			btn.opacity(0.5);
		});
		this.group.getLayer()?.batchDraw();
	}

	// -------------------------------
	// FEEDBACK TEXT
	// -------------------------------
	showFeedback(message: string, color: string) {
		const old = this.group.findOne('#mtFeedback');
		if (old) old.destroy();

		const feedback = new Konva.Text({
			id: 'mtFeedback',
			text: message,
			fontSize: 30,
			fill: color,
			x: STAGE_WIDTH / 2,
			y: STAGE_HEIGHT - 150,
			align: 'center',
			width: STAGE_WIDTH - 80,
		});

		feedback.offsetX((STAGE_WIDTH - 80) / 2);
		this.group.add(feedback);
		this.group.getLayer()?.draw();
	}

	// -------------------------------
	// MAIN RENDER
	// -------------------------------
	renderSlide(slide: any, index: number, total: number): void {
		this.clear();

		// RETURN TO MENU
		const returnBtn = createButton({
			x: 30,
			y: STAGE_HEIGHT - 90,
			width: 240,
			height: 55,
			text: 'RETURN TO MENU',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: this.onMenu,
		});
		this.group.add(returnBtn);

		// Title
		const titleText = slide.type === 'question' ? slide.question : slide.title;

		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 60,
			text: titleText,
			fontSize: 36,
			fill: theme.get('white'),
			align: 'center',
			width: STAGE_WIDTH - 60,
		});
		title.offsetX((STAGE_WIDTH - 60) / 2);
		this.group.add(title);

		// INFO SLIDE BODY
		if (slide.type === 'info') {
			const body = new Konva.Text({
				x: STAGE_WIDTH / 2,
				y: 150,
				text: slide.text,
				fontSize: 28,
				fill: theme.get('white'),
				align: 'center',
				width: STAGE_WIDTH - 120,
			});
			body.offsetX((STAGE_WIDTH - 120) / 2);
			this.group.add(body);

			// START QUIZ BUTTON
			const startBtn = createButton({
				x: STAGE_WIDTH / 2 - 150,
				y: 380,
				width: 300,
				height: 65,
				text: 'START QUIZ',
				colorKey: 'primary',
				hoverColorKey: 'primary_hover',
				onClick: () => this.onChoice('START'),
			});
			this.group.add(startBtn);
		}

		// QUESTION SLIDE
		if (slide.type === 'question') {
			// Question counter
			const counter = new Konva.Text({
				x: STAGE_WIDTH / 2,
				y: 140,
				text: `Question ${index} of ${total}`,
				fontSize: 26,
				fill: theme.get('info'),
				align: 'center',
				width: STAGE_WIDTH - 60,
			});
			counter.offsetX((STAGE_WIDTH - 60) / 2);
			this.group.add(counter);

			// Choices
			let y = 240;
			for (const choice of slide.choices) {
				const btn = createButton({
					x: STAGE_WIDTH / 2 - 150,
					y,
					width: 300,
					height: 60,
					text: choice,
					colorKey: 'cosmic_purple',
					hoverColorKey: 'accent_blue',
					onClick: () => this.onChoice(choice),
				});

				btn.name('mt-btn');
				this.group.add(btn);
				y += 90;
			}
		}

		this.group.getLayer()?.draw();
	}

	// -------------------------------
	// RESULT SLIDE
	// -------------------------------
	renderResult(passed: boolean, onTryAgain: () => void, onGoEarth: () => void) {
		this.clear();

		const msg = passed ? '🎉 GREAT JOB!\nYou passed!' : 'You did not pass.\nYou need 7 correct.';

		const txt = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 150,
			text: msg,
			fontSize: 40,
			fill: theme.get('alien_green'),
			align: 'center',
			width: STAGE_WIDTH - 100,
		});
		txt.offsetX((STAGE_WIDTH - 100) / 2);
		this.group.add(txt);

		const btn = createButton({
			x: STAGE_WIDTH / 2 - 150,
			y: 350,
			width: 300,
			height: 65,
			text: passed ? 'GO TO EARTH GAME' : 'TRY AGAIN',
			colorKey: 'primary',
			hoverColorKey: 'primary_hover',
			onClick: passed ? onGoEarth : onTryAgain,
		});
		this.group.add(btn);

		this.group.getLayer()?.draw();
	}
}
