import { ScreenController } from '../../types';
import type { ScreenSwitcher } from '../../types';
import { EarthScreenView } from './EarthScreenView';
import { EarthScreenModel } from './EarthScreenModel';
import { EarthLogic } from '../../planets/earth/EarthLogic';
import Konva from 'konva';
import { STAGE_WIDTH, STAGE_HEIGHT } from '../../configs/GameConfig';
import { generateTimeQuestion } from '../../core/utils/timeArithmetic';

export class EarthScreenController extends ScreenController {
	private view: EarthScreenView;
	private model: EarthScreenModel;
	private logic: EarthLogic;
	private screenSwitcher: ScreenSwitcher;
	private inputBox: HTMLInputElement | null = null;

	private questionText!: Konva.Text;
	private attemptsIndicator!: Konva.Text;
	private previousButtonGroup!: Konva.Group;
	private nextButtonGroup!: Konva.Group;

	private history: ReturnType<typeof generateTimeQuestion>[] = [];

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new EarthScreenView();
		this.model = new EarthScreenModel();
		this.logic = new EarthLogic(this.view.getGroup());
		this.logic.initializeClock();

		// --------------------------------------------------------
		// QUESTION TEXT + ATTEMPTS
		// --------------------------------------------------------
		this.questionText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 120,
			text: '',
			fontSize: 26,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});
		this.questionText.offsetX(this.questionText.width() / 2);
		this.view.getGroup().add(this.questionText);

		this.attemptsIndicator = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 160,
			text: '',
			fontSize: 20,
			fontFamily: 'Arial',
			fill: 'lightgray',
		});
		this.attemptsIndicator.offsetX(this.attemptsIndicator.width() / 2);
		this.view.getGroup().add(this.attemptsIndicator);

		// --------------------------------------------------------
		// PREVIOUS QUESTION BUTTON
		// --------------------------------------------------------
		this.previousButtonGroup = new Konva.Group({
			x: STAGE_WIDTH / 2 - 220,
			y: STAGE_HEIGHT / 2 + 280,
			visible: true,
		});

		const prevRect = new Konva.Rect({
			width: 200,
			height: 50,
			fill: '#555',
			cornerRadius: 10,
			stroke: 'white',
			strokeWidth: 2,
			name: 'prevRect',
		});

		const prevText = new Konva.Text({
			x: 100,
			y: 15,
			text: '← Previous Question',
			fontSize: 18,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});
		prevText.offsetX(prevText.width() / 2);

		this.previousButtonGroup.add(prevRect);
		this.previousButtonGroup.add(prevText);

		this.previousButtonGroup.on('mouseenter', () => (document.body.style.cursor = 'pointer'));
		this.previousButtonGroup.on('mouseleave', () => (document.body.style.cursor = 'default'));
		this.previousButtonGroup.on('click', () => this.loadPreviousQuestion());

		this.view.getGroup().add(this.previousButtonGroup);

		// Start dimmed for Q1
		this.previousButtonGroup.listening(false);
		prevRect.opacity(0.4);

		// --------------------------------------------------------
		// NEXT QUESTION BUTTON
		// --------------------------------------------------------
		this.nextButtonGroup = new Konva.Group({
			x: STAGE_WIDTH / 2 + 20,
			y: STAGE_HEIGHT / 2 + 280,
			visible: false,
		});

		const nextRect = new Konva.Rect({
			width: 200,
			height: 50,
			fill: '#2e8b57',
			cornerRadius: 10,
			stroke: 'white',
			strokeWidth: 2,
		});

		const nextText = new Konva.Text({
			x: 100,
			y: 15,
			text: 'Next Question →',
			fontSize: 18,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});
		nextText.offsetX(nextText.width() / 2);

		this.nextButtonGroup.add(nextRect);
		this.nextButtonGroup.add(nextText);
		this.nextButtonGroup.on('mouseenter', () => (document.body.style.cursor = 'pointer'));
		this.nextButtonGroup.on('mouseleave', () => (document.body.style.cursor = 'default'));
		this.nextButtonGroup.on('click', () => this.loadNewQuestion());

		this.view.getGroup().add(this.nextButtonGroup);

		// --------------------------------------------------------
		// BACK TO MENU BUTTON
		// --------------------------------------------------------
		const backButtonGroup = new Konva.Group({
			x: 40,
			y: STAGE_HEIGHT - 80,
		});
		const backRect = new Konva.Rect({
			width: 200,
			height: 50,
			fill: '#333',
			cornerRadius: 10,
			stroke: 'white',
			strokeWidth: 2,
		});
		const backText = new Konva.Text({
			x: 100,
			y: 15,
			text: '← Back to Menu',
			fontSize: 18,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});
		backText.offsetX(backText.width() / 2);
		backButtonGroup.add(backRect);
		backButtonGroup.add(backText);
		backButtonGroup.on('mouseenter', () => (document.body.style.cursor = 'pointer'));
		backButtonGroup.on('mouseleave', () => (document.body.style.cursor = 'default'));
		backButtonGroup.on('click', () => this.screenSwitcher.switchToScreen({ type: 'menu' }));
		this.view.getGroup().add(backButtonGroup);

		this.model.currentQuestion = 0; // added this to reset state
		this.model.correctAnswers = 0; // added this to reset state
		this.model.attempts = 0; // added this to reset state
		this.history = []; // added this to reset state

		this.loadNewQuestion();
	}

	// --------------------------------------------------------
	// INPUT BOX CREATION
	// --------------------------------------------------------
	private createInputBox(): void {
		this.removeInputBox();
		const container = document.getElementById('container');
		if (!container) return;

		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = 'Enter your answer (e.g. 14:30)';
		input.style.position = 'absolute';
		input.style.width = '340px';
		input.style.padding = '12px';
		input.style.fontSize = '20px';
		input.style.border = '2px solid white';
		input.style.borderRadius = '10px';
		input.style.background = '#1a1a1a';
		input.style.color = 'white';
		input.style.textAlign = 'center';
		input.style.left = `${STAGE_WIDTH / 2 - 170}px`;
		input.style.top = `${STAGE_HEIGHT / 2 + 170}px`;

		container.style.position = 'relative';
		container.appendChild(input);

		input.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				this.handleAnswer(input.value.trim());
				input.value = '';
			}
		});
		this.inputBox = input;
	}

	private removeInputBox(): void {
		if (this.inputBox && this.inputBox.parentNode) {
			this.inputBox.parentNode.removeChild(this.inputBox);
			this.inputBox = null;
		}
	}

	// --------------------------------------------------------
	// QUESTION MANAGEMENT
	// --------------------------------------------------------
	private loadNewQuestion(): void {
		// Stop if all questions are complete
		if (this.model.currentQuestion >= this.model.totalQuestions) {
			this.showGameOver();
			return;
		}

		this.clearFeedback();
		this.nextButtonGroup.visible(false);

		const q = generateTimeQuestion();
		this.history.push(q);

		this.model.correctHour = q.correctHour;
		this.model.correctMinute = q.correctMinute;
		this.model.attempts = 0;

		// Render first, THEN increment counter
		this.renderQuestion(q);
		this.model.currentQuestion++;
	}

	// --------------------------------------------------------
	// LOAD PREVIOUS QUESTION
	// --------------------------------------------------------
	private loadPreviousQuestion(): void {
		// Prevent moving back before first question
		if (this.model.currentQuestion <= 1) return;

		this.clearFeedback();
		this.nextButtonGroup.visible(false);

		// Move back one index
		this.model.currentQuestion -= 2; // because loadNewQuestion() increments
		const prevQ = this.history[this.model.currentQuestion];
		if (prevQ) this.renderQuestion(prevQ);
	}

	// --------------------------------------------------------
	// RENDER A QUESTION (used for both new and previous)
	// --------------------------------------------------------
	// --------------------------------------------------------
	// RENDER A QUESTION (used for both new and previous)
	// --------------------------------------------------------
	private renderQuestion(q: ReturnType<typeof generateTimeQuestion>): void {
		this.questionText.text(`Q${this.model.currentQuestion + 1}: ${q.question}`);
		this.questionText.offsetX(this.questionText.width() / 2);

		this.logic.setClockTime(q.startHour, q.startMinute);
		this.updateAttemptIndicator();

		// Enable or disable Previous button dynamically
		const isPrevEnabled = this.model.currentQuestion > 0;
		this.previousButtonGroup.listening(isPrevEnabled);
		const prevRect = this.previousButtonGroup.findOne<Konva.Rect>('.prevRect');
		if (prevRect) prevRect.opacity(isPrevEnabled ? 1 : 0.4);

		this.view.getGroup().getLayer()?.batchDraw();
	}

	// --------------------------------------------------------
	// ANSWER HANDLING
	// --------------------------------------------------------
	private handleAnswer(userInput: string): void {
		const match = /^0?(\d{1,2}):(\d{2})$/.exec(userInput);
		if (!match) {
			this.showFeedback('Please enter a valid time like 14:30', false);
			return;
		}

		const userHour = parseInt(match[1], 10);
		const userMinute = parseInt(match[2], 10);

		const { correctHour, correctMinute, maxAttempts } = this.model;
		const normalize = (h: number, m: number) => ({
			hour: h % 24,
			minute: m % 60,
		});

		const user = normalize(userHour, userMinute);
		const correct = normalize(correctHour, correctMinute);

		this.model.attempts += 1;
		this.updateAttemptIndicator();

		const isCorrect = user.hour === correct.hour && user.minute === correct.minute;

		if (isCorrect) {
			this.showFeedback('Correct!', true);
			this.animateClockTo(correctHour, correctMinute);
			this.model.correctAnswers++;
			this.model.attempts = 0;
		} else if (this.model.attempts < maxAttempts) {
			const remaining = maxAttempts - this.model.attempts;
			this.showFeedback(
				`Try again! You have ${remaining} attempt${remaining > 1 ? 's' : ''} left.`,
				false
			);
		} else {
			this.showFeedback(
				`Out of attempts! The correct time was ${this.formatTime(correctHour, correctMinute)}.`,
				true
			);
			this.animateClockTo(correctHour, correctMinute);
			this.model.attempts = 0;
		}
	}

	// --------------------------------------------------------
	// FEEDBACK + ATTEMPTS
	// --------------------------------------------------------
	private updateAttemptIndicator(): void {
		this.attemptsIndicator.text(`Attempts: ${this.model.attempts} / ${this.model.maxAttempts}`);
		this.attemptsIndicator.offsetX(this.attemptsIndicator.width() / 2);
		this.view.getGroup().getLayer()?.batchDraw();
	}

	// --------------------------------------------------------
	// FEEDBACK + ATTEMPTS
	// --------------------------------------------------------
	private showFeedback(message: string, allowNext = false): void {
		const old = this.view.getGroup().findOne('#feedbackText');
		if (old) old.destroy();

		const feedback = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: STAGE_HEIGHT / 2 + 230,
			text: message,
			fontSize: 26,
			fontFamily: 'Arial',
			fill: message.startsWith('Correct') ? 'lightgreen' : 'red',
			id: 'feedbackText',
		});
		feedback.offsetX(feedback.width() / 2);
		this.view.getGroup().add(feedback);

		// Only show "Next Question" button if answer is correct OR out of attempts
		this.nextButtonGroup.visible(allowNext);

		this.view.getGroup().getLayer()?.batchDraw();
	}

	private clearFeedback(): void {
		const feedback = this.view.getGroup().findOne('#feedbackText');
		if (feedback) feedback.destroy();
		this.view.getGroup().getLayer()?.batchDraw();
	}

	// --------------------------------------------------------
	// CLOCK ANIMATION
	// --------------------------------------------------------
	private animateClockTo(hour: number, minute: number): void {
		const start = performance.now();
		const duration = 1000;

		const animate = (now: number) => {
			const progress = Math.min((now - start) / duration, 1);
			this.logic.setClockTime(hour, minute * progress);
			if (progress < 1) requestAnimationFrame(animate);
		};
		requestAnimationFrame(animate);
	}

	// --------------------------------------------------------
	// GAME OVER SCREEN
	// --------------------------------------------------------
	private showGameOver(): void {
		this.clearFeedback();

		const boxWidth = 500;
		const boxHeight = 120;
		const boxX = STAGE_WIDTH / 2 - boxWidth / 2;
		const boxY = STAGE_HEIGHT / 2 - boxHeight / 2;

		const bgBox = new Konva.Rect({
			x: boxX,
			y: boxY,
			width: boxWidth,
			height: boxHeight,
			fill: 'white',
			opacity: 0.85,
			cornerRadius: 15,
		});
		this.view.getGroup().add(bgBox);

		const finalText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: STAGE_HEIGHT / 2,
			text: `You completed all ${this.model.totalQuestions} questions!\nScore: ${this.model.correctAnswers}/${this.model.totalQuestions}`,
			fontSize: 26,
			fontFamily: 'Arial',
			fill: 'black',
			align: 'center',
		});
		finalText.offsetX(finalText.width() / 2);
		finalText.offsetY(finalText.height() / 2);

		this.view.getGroup().add(finalText);
		this.view.getGroup().getLayer()?.batchDraw();

		if (this.inputBox) this.inputBox.disabled = true;
	}

	// --------------------------------------------------------
	// UTILITY
	// --------------------------------------------------------
	private formatTime(hour: number, minute: number): string {
		const h = hour.toString().padStart(2, '0');
		const m = minute.toString().padStart(2, '0');
		return `${h}:${m}`;
	}

	// --------------------------------------------------------
	// SCREEN LIFECYCLE
	// --------------------------------------------------------
	override show(): void {
		super.show();
		this.view.show();
		this.createInputBox();
	}

	override hide(): void {
		super.hide();
		this.view.hide();
		this.removeInputBox();
	}

	override update(_deltaTime: number): void {}

	getView(): EarthScreenView {
		return this.view;
	}
}
