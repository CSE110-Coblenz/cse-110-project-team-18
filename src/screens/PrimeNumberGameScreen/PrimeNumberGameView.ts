import Konva from 'konva';
import type { View } from '../../types.ts';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { theme } from '../../configs/ThemeConfig.ts';
import { createButton, createTextBox, setElementText } from '../../ui/factory/ElementFactory.ts';
import { preloadImage } from '../../core/utils/AssetLoader';

/**
 * Manages all Konva UI elements for the Prime Number Game.
 */
export class PrimeNumberGameView implements View {
	private group: Konva.Group;

	// UI Elements
	private scoreDisplay: Konva.Group;
	private questionNumber: Konva.Group;
	private questionText: Konva.Group;
	private feedbackText: Konva.Group;
	private summaryLabel: Konva.Group;

	private yesButton: Konva.Group;
	private noButton: Konva.Group;
	private gameOverButton: Konva.Group | null = null;

	constructor() {
		this.group = new Konva.Group({
			visible: false,
			id: 'primeNumberGameScreen',
		});

		// BACKGROUND IMAGE
		const background = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			listening: false,
			image: new Image(),
		});

		void preloadImage('/assets/ui/MarsBG.png').then((img) => {
			background.image(img);
			this.group.getLayer()?.batchDraw();
		});

		this.group.add(background);

		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 50,
			text: 'Is that Prime!',
			fontSize: 48,
			fontFamily: theme.fontFamilyDefault,
			fill: theme.get('mars_red'),
			align: 'center',
		});

		title.offsetX(title.width() / 2);
		this.group.add(title);

		// Score Number
		this.scoreDisplay = createTextBox(
			{
				x: 20,
				y: 30,
				width: 150,
				height: 30,
				text: 'Score: 0',
				colorKey: 'surface_alt',
				fontColorKey: 'info',
				fontSize: 20,
				padding: 5,
			},
			theme
		);

		// Question Number
		this.questionNumber = createTextBox(
			{
				x: 20,
				y: 70,
				width: 180,
				height: 30,
				text: 'Question: 1 / 10',
				colorKey: 'surface_alt',
				fontColorKey: 'warning',
				fontSize: 20,
				padding: 5,
			},
			theme
		);

		// Question Text
		this.questionText = createTextBox(
			{
				x: 50,
				y: 150,
				width: STAGE_WIDTH - 100,
				height: 150,
				text: 'Is 17 a prime number?',
				colorKey: 'surface',
				fontColorKey: 'text_inverse',
				fontSize: 32,
				padding: 20,
			},
			theme
		);

		// Feedback Text
		this.feedbackText = createTextBox(
			{
				x: 50,
				y: 320,
				width: STAGE_WIDTH - 100,
				height: 50,
				text: ' ',
				colorKey: 'transparent',
				fontColorKey: 'text_inverse',
				fontSize: 24,
				padding: 10,
			},
			theme
		);

		const feedbackBg = this.feedbackText.findOne<Konva.Rect>('Rect');
		if (feedbackBg) {
			feedbackBg.strokeWidth(0);
		}

		// Summary Label
		this.summaryLabel = createTextBox(
			{
				x: 50,
				y: 400,
				width: STAGE_WIDTH - 100,
				height: 80,
				text: ' ',
				colorKey: 'transparent',
				fontColorKey: 'text_inverse',
				fontSize: 24,
				padding: 10,
			},
			theme
		);
		this.summaryLabel.visible(false);
		const summaryBg = this.summaryLabel.findOne<Konva.Rect>('Rect');
		if (summaryBg) {
			summaryBg.strokeWidth(0);
		}

		// Buttons
		this.yesButton = createButton(
			{
				x: STAGE_WIDTH / 2 - 160,
				y: 400,
				width: 150,
				height: 60,
				text: 'YES',
				colorKey: 'primary',
				hoverColorKey: 'primary_hover',
			},
			theme
		);

		this.noButton = createButton(
			{
				x: STAGE_WIDTH / 2 + 10,
				y: 400,
				width: 150,
				height: 60,
				text: 'NO',
				colorKey: 'error',
				hoverColorKey: 'error_hover',
			},
			theme
		);

		this.group.add(
			this.scoreDisplay,
			this.questionNumber,
			this.questionText,
			this.feedbackText,
			this.summaryLabel,
			this.yesButton,
			this.noButton
		);
	}

	public show(): void {
		this.group.visible(true);
	}

	public hide(): void {
		this.group.visible(false);
	}

	public getGroup(): Konva.Group {
		return this.group;
	}

	public updateQuestion(questionText: string, index: number, total: number): void {
		setElementText(this.questionText, questionText);
		setElementText(this.questionNumber, `Question: ${index + 1} / ${total}`);
		setElementText(this.feedbackText, ' ');
		this.setAnswerButtonsDisabled(false);
	}

	public updateScore(newScore: number): void {
		setElementText(this.scoreDisplay, `Score: ${newScore}`);
	}

	public displayFeedback(isCorrect: boolean): void {
		this.setAnswerButtonsDisabled(true);
		const feedbackText = isCorrect ? 'Correct!' : `Incorrect!`;

		setElementText(this.feedbackText, feedbackText);

		const txt = this.feedbackText.findOne<Konva.Text>('Text');
		if (txt) {
			txt.fill(isCorrect ? theme.get('success') : theme.get('error'));
		}
	}

	public setAnswerButtonsDisabled(isDisabled: boolean): void {
		if (isDisabled) {
			this.yesButton.listening(false);
			this.noButton.listening(false);
			this.yesButton.opacity(0.5);
			this.noButton.opacity(0.5);
		} else {
			this.yesButton.listening(true);
			this.noButton.listening(true);
			this.yesButton.opacity(1);
			this.noButton.opacity(1);
		}
	}

	public bindSubmitAnswer(handler: (answer: string) => void): void {
		this.yesButton.on('click', () => {
			handler('yes');
		});

		this.noButton.on('click', () => {
			handler('no');
		});
	}

	public displaySummary(correctAnswers: number, maxNumberOfQuestions: number, minNumberOfQuestionsToWin: number): void {
		const passed = correctAnswers >= minNumberOfQuestionsToWin;
		const summary = `You answered ${correctAnswers / 10} / ${maxNumberOfQuestions / 10} correctly.\n${
			passed
				? 'Great job! Ready for the asteroid field!'
				: 'Keep practicing until you reach 80%.'
		}`;

		setElementText(this.summaryLabel, summary);

		const txt = this.summaryLabel.findOne<Konva.Text>('Text');
		if (txt) {
			txt.fill(passed ? theme.get('success') : theme.get('warning'));
		}

		// Hide the yes/no buttons
		this.yesButton.visible(false);
		this.noButton.visible(false);
		this.summaryLabel.visible(true);
		this.group.getLayer()?.batchDraw();
	}

	public showGameOverScreen(onRetry: (() => void) | null, onSuccess: (() => void) | null): void {
		if (onSuccess) {
			const continueBtn = createButton(
				{
					x: STAGE_WIDTH / 2 - 150,
					y: 510,
					width: 300,
					height: 70,
					text: 'CONTINUE',
					colorKey: 'primary',
					hoverColorKey: 'primary_hover',
					onClick: onSuccess,
				},
				theme
			);
			this.group.add(continueBtn);
			this.gameOverButton = continueBtn;
		} else if (onRetry) {
			const retryBtn = createButton(
				{
					x: STAGE_WIDTH / 2 - 150,
					y: 510,
					width: 300,
					height: 70,
					text: 'RETRY',
					colorKey: 'primary',
					hoverColorKey: 'primary_hover',
					onClick: onRetry,
				},
				theme
			);
			this.group.add(retryBtn);
			this.gameOverButton = retryBtn;
		}

		this.group.getLayer()?.batchDraw();
	}

	public resetUI(): void {
		// Remove the retry if it exists
		if (this.gameOverButton) {
			this.gameOverButton.destroy();
			this.gameOverButton = null;
		}
		// Show buttons again
		this.yesButton.visible(true);
		this.noButton.visible(true);
		// Hide summary label
		this.summaryLabel.visible(false);
		// Clear feedback
		setElementText(this.feedbackText, ' ');
		// Reset button states
		this.setAnswerButtonsDisabled(false);
		this.group.getLayer()?.batchDraw();
	}
}
