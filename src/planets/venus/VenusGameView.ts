import Konva from 'konva';
import type { View } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { theme } from '../../configs/ThemeConfig.ts';
import { createButton, createTextBox, setElementText } from '../../ui/factory/ElementFactory.ts';
import { preloadImage } from '../../core/utils/AssetLoader';

/**
 * VenusGameView renders the UI for the Venus math challenge.
 */
export class VenusGameView implements View {
	private group: Konva.Group;

	// UI Elements (includes rapid-fire HUD pieces)
	private progressLabel: Konva.Group;
	private correctCountLabel: Konva.Group; // live correct counter for speed round
	private questionLabel: Konva.Group;
	private feedbackLabel: Konva.Group;
	private summaryLabel: Konva.Group;
	private submitButton: Konva.Group;
	private timerLabel: Konva.Group; // countdown for rapid-fire
	private modalGroup: Konva.Group; // intro overlay for rapid-fire
	private modalBody: Konva.Text;
	private returnButton: Konva.Group;

	constructor(onSubmitAnswer: () => void, onReturnToMenu: () => void) {
		this.group = new Konva.Group({
			visible: false,
			id: 'venusGameScreen',
		});

		// Background
		const background = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			listening: false,
			image: new Image(),
		});

		void preloadImage('/assets/ui/VenusBG.png').then((img) => {
			background.image(img);
			this.group.getLayer()?.batchDraw(); // Redraw once image is loaded
		});

		this.group.add(background);

		// Title
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 80,
			width: STAGE_WIDTH - 120,
			text: 'Venus Math Mission',
			align: 'center',
			fontSize: 48,
			fontFamily: theme.fontFamilyDefault,
			fill: theme.get('meteor_orange'),
		});
		title.offsetX((STAGE_WIDTH - 120) / 2);
		this.group.add(title);

		// Progress Label
		this.progressLabel = createTextBox(
			{
				x: STAGE_WIDTH / 2 - (STAGE_WIDTH - 120) / 2,
				y: 170,
				width: STAGE_WIDTH - 120,
				height: 30,
				text: 'Question 1 of 10',
				colorKey: 'transparent',
				fontColorKey: 'warning',
				fontSize: 26,
				padding: 0,
			},
			theme
		);
		this.group.add(this.progressLabel);

		this.correctCountLabel = createTextBox(
			{
				x: STAGE_WIDTH - 250,
				y: 170,
				width: 200,
				height: 30,
				text: 'Correct: 0',
				colorKey: 'transparent',
				fontColorKey: 'info',
				fontSize: 22,
				padding: 0,
			},
			theme
		);
		this.group.add(this.correctCountLabel);

		// Question Label
		this.questionLabel = createTextBox(
			{
				x: STAGE_WIDTH / 2 - (STAGE_WIDTH - 160) / 2,
				y: 230,
				width: STAGE_WIDTH - 160,
				height: 40,
				text: 'Solve the equation to continue your mission.',
				colorKey: 'transparent',
				fontColorKey: 'text_inverse',
				fontSize: 36,
				padding: 0,
			},
			theme
		);
		this.group.add(this.questionLabel);

		// Feedback Label
		this.feedbackLabel = createTextBox(
			{
				x: STAGE_WIDTH / 2 - (STAGE_WIDTH - 160) / 2,
				y: 320,
				width: STAGE_WIDTH - 160,
				height: 30,
				text: 'Type your answer below and press submit.',
				colorKey: 'transparent',
				fontColorKey: 'info',
				fontSize: 24,
				padding: 0,
			},
			theme
		);
		this.group.add(this.feedbackLabel);

		this.timerLabel = createTextBox(
			{
				x: 50,
				y: 170,
				width: 200,
				height: 30,
				text: '',
				colorKey: 'transparent',
				fontColorKey: 'warning',
				fontSize: 20,
				padding: 0,
			},
			theme
		);
		this.timerLabel.visible(false);
		this.group.add(this.timerLabel);

		// Summary Label
		this.summaryLabel = createTextBox(
			{
				x: STAGE_WIDTH / 2 - (STAGE_WIDTH - 200) / 2,
				y: 400,
				width: STAGE_WIDTH - 200,
				height: 60,
				text: '',
				colorKey: 'transparent',
				fontColorKey: 'warning',
				fontSize: 24,
				padding: 0,
			},
			theme
		);
		this.summaryLabel.visible(false);
		this.group.add(this.summaryLabel);

		// Submit Button
		this.submitButton = createButton({
			x: STAGE_WIDTH / 2 - 160,
			y: STAGE_HEIGHT - 160,
			width: 320,
			height: 60,
			text: 'SUBMIT ANSWER',
			colorKey: 'meteor_orange',
			hoverColorKey: 'warning',
			onClick: onSubmitAnswer,
		});
		this.group.add(this.submitButton);

		this.modalGroup = new Konva.Group({
			visible: false,
			x: STAGE_WIDTH / 2,
			y: STAGE_HEIGHT / 2,
		});

		const modalBg = new Konva.Rect({
			x: -380,
			y: -170,
			width: 760,
			height: 340,
			fill: 'rgba(15, 23, 42, 0.96)',
			cornerRadius: 22,
			stroke: 'rgba(255,255,255,0.08)',
			strokeWidth: 2,
		});
		this.modalGroup.add(modalBg);

		const modalTitle = new Konva.Text({
			x: -340,
			y: -130,
			width: 680,
			text: 'Venus Challenge',
			align: 'center',
			fontSize: 34,
			fontFamily: theme.fontFamilyDefault,
			fill: theme.get('text_inverse'),
		});
		this.modalGroup.add(modalTitle);

		this.modalBody = new Konva.Text({
			x: -340,
			y: -70,
			width: 680,
			text: '',
			align: 'center',
			fontSize: 22,
			fontFamily: theme.fontFamilyDefault,
			fill: theme.get('asteroid_gray'),
			lineHeight: 1.5,
			letterSpacing: 1,
		});
		this.modalGroup.add(this.modalBody);

		this.group.add(this.modalGroup);

		// Return Button
		this.returnButton = createButton({
			x: 50,
			y: 50,
			width: 275,
			height: 60,
			text: 'RETURN TO MENU',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			fontColorKey: 'text_inverse',
			onClick: onReturnToMenu,
		});
		this.group.add(this.returnButton);
	}

	getGroup(): Konva.Group {
		return this.group;
	}

	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.batchDraw();
	}

	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.batchDraw();
	}

	public setReturnButtonVisible(isVisible: boolean): void {
		// Hide during rapid-fire summary to keep players in the finale loop.
		this.returnButton.visible(isVisible);
		this.returnButton.listening(isVisible);
		this.group.getLayer()?.batchDraw();
	}

	public setSubmitLabel(text: string): void {
		setElementText(this.submitButton, text);
		this.group.getLayer()?.batchDraw();
	}

	public displayQuestion(
		questionIndex: number,
		totalQuestions: number,
		questionText: string,
		correctCount?: number
	): void {
		setElementText(this.progressLabel, `Question ${questionIndex + 1} of ${totalQuestions}`);
		setElementText(this.questionLabel, questionText);
		this.summaryLabel.visible(false);
		if (typeof correctCount === 'number') {
			this.updateCorrectCount(correctCount); // surface live tally in rapid fire
		}

		this.showMessage('Type your answer below and press submit.', theme.get('info'));
		this.hideTimer();
		this.group.getLayer()?.batchDraw();
	}

	public showMessage(message: string, color?: string): void {
		setElementText(this.feedbackLabel, message);

		const txt = this.feedbackLabel.findOne<Konva.Text>('Text');
		if (txt) {
			txt.fill(color || theme.get('info'));
		}
		this.group.getLayer()?.batchDraw();
	}

	public displayResult(isCorrect: boolean, questionText: string, answerText: number): void {
		const color = isCorrect ? theme.get('success') : theme.get('error');
		const message = isCorrect
			? 'Correct! Nice work!'
			: `Incorrect. ${questionText} = ${answerText}`;

		this.showMessage(message, color);
	}

	public updateCorrectCount(correctCount: number): void {
		setElementText(this.correctCountLabel, `Correct: ${correctCount}`);
		this.group.getLayer()?.batchDraw();
	}

	public updateTimer(text: string): void {
		// Countdown label used exclusively in the rapid-fire finale.
		setElementText(this.timerLabel, text);
		this.timerLabel.visible(true);
		this.group.getLayer()?.batchDraw();
	}

	public hideTimer(): void {
		this.timerLabel.visible(false);
		this.group.getLayer()?.batchDraw();
	}

	public showModal(body: string): void {
		// Modal intro shown before the rapid-fire finale begins.
		this.modalBody.text(body);
		this.modalGroup.visible(true);
		this.modalGroup.moveToTop();
		this.group.getLayer()?.batchDraw();
	}

	public hideModal(): void {
		this.modalGroup.visible(false);
		this.group.getLayer()?.batchDraw();
	}

	public displaySummary(
		correctAnswers: number,
		maxNumberOfQuestions: number,
		minNumberOfQuestionsToWin: number
	): void {
		const passed = correctAnswers >= minNumberOfQuestionsToWin;
		const summary = `You answered ${correctAnswers} / ${maxNumberOfQuestions} correctly.\n${
			passed
				? 'You gathered enough data to leave Venus!'
				: `Keep practicing until you reach ${minNumberOfQuestionsToWin}.`
		}`;

		setElementText(this.summaryLabel, summary);

		const color = passed ? theme.get('success') : theme.get('warning');

		const txt = this.summaryLabel.findOne<Konva.Text>('Text');
		if (txt) {
			txt.fill(color);
		}

		this.summaryLabel.visible(true);
		this.group.getLayer()?.batchDraw();
	}
}
