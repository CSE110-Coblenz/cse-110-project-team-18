// --------------------------------------------------------
// EARTH SCREEN CONTROLLER — FULLY FIXED VERSION
// --------------------------------------------------------
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

	// History includes userAnswer now
	private history: {
		data: ReturnType<typeof generateTimeQuestion>;
		attempts: number;
		completed: boolean;
		userAnswer?: string;
	}[] = [];

	private currentIndex = 0;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new EarthScreenView();
		this.model = new EarthScreenModel();
		this.logic = new EarthLogic(this.view.getGroup());
		this.logic.initializeClock();

		this.setupUI();
		this.resetGameState();
		this.loadQuestionAtIndex(0);
	}

	// --------------------------------------------------------
	// INITIALIZATION
	// --------------------------------------------------------
	private setupUI(): void {
		this.questionText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 120,
			text: '',
			fontSize: 26,
			fontFamily: 'Arial',
			fill: 'white',
			align: 'center',
		});
		this.view.getGroup().add(this.questionText);

		this.attemptsIndicator = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 160,
			text: '',
			fontSize: 20,
			fontFamily: 'Arial',
			fill: 'lightgray',
		});
		this.view.getGroup().add(this.attemptsIndicator);

		// Previous button
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
		this.previousButtonGroup.on('click', () => this.loadPreviousQuestion());
		this.view.getGroup().add(this.previousButtonGroup);

		// Next button — starts hidden
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
		this.nextButtonGroup.on('click', () => this.loadNextQuestion());
		this.view.getGroup().add(this.nextButtonGroup);
	}

	private resetGameState(): void {
		this.model.correctAnswers = 0;
		this.model.currentQuestion = 0;
		this.model.attempts = 0;
		this.history = [];
		this.currentIndex = 0;
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
		Object.assign(input.style, {
			position: 'absolute',
			width: '340px',
			padding: '12px',
			fontSize: '20px',
			border: '2px solid white',
			borderRadius: '10px',
			background: '#1a1a1a',
			color: 'white',
			textAlign: 'center',
			left: `${STAGE_WIDTH / 2 - 170}px`,
			top: `${STAGE_HEIGHT / 2 + 170}px`,
		});

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
		if (this.inputBox?.parentNode) this.inputBox.parentNode.removeChild(this.inputBox);
		this.inputBox = null;
	}

	// --------------------------------------------------------
	// CENTRAL QUESTION LOADING
	// --------------------------------------------------------
	private loadQuestionAtIndex(index: number): void {
		this.clearFeedback();
		this.nextButtonGroup.visible(false);

		// Create history entry if missing
		if (!this.history[index]) {
			const q = generateTimeQuestion();
			this.history[index] = { 
				data: q, 
				attempts: 0, 
				completed: false,
				userAnswer: undefined
			};
		}

		const entry = this.history[index];
		this.currentIndex = index;
		this.model.correctHour = entry.data.correctHour;
		this.model.correctMinute = entry.data.correctMinute;
		this.model.attempts = entry.attempts;

		// Normal rendering
		this.renderQuestion(entry.data);
		this.logic.setClockTime(entry.data.startHour, entry.data.startMinute);
		this.updateAttemptIndicator();

		// Input state
		if (this.inputBox) {
			this.inputBox.disabled = entry.completed;
			this.inputBox.style.opacity = entry.completed ? '0.5' : '1';
		}

		// Previous button enable/disable
		const prevRect = this.previousButtonGroup.findOne<Konva.Rect>('.prevRect');
		if (prevRect) {
			prevRect.opacity(index === 0 ? 0.4 : 1);
			this.previousButtonGroup.listening(index > 0);
		}

		// --------------------------------------------------------
		// 🟢 RESTORE COMPLETED QUESTION UI — BUG 2 FIX
		// --------------------------------------------------------
		if (entry.completed) {
			const correctText = this.formatTime(entry.data.correctHour, entry.data.correctMinute);

			const msg = entry.userAnswer
				? `Your answer was ${entry.userAnswer}. The correct time was ${correctText}.`
				: `The correct time was ${correctText}.`;

			this.showFeedback(msg, true);

			// Lock input
			if (this.inputBox) {
				this.inputBox.disabled = true;
				this.inputBox.style.opacity = '0.5';
			}

			// Enable next button if not last
			this.nextButtonGroup.visible(
				this.currentIndex < this.model.totalQuestions - 1
			);
		}

		this.view.getGroup().getLayer()?.batchDraw();
	}

	// --------------------------------------------------------
	// NAVIGATION
	// --------------------------------------------------------
	private loadNextQuestion(): void {
		if (this.currentIndex + 1 >= this.model.totalQuestions) {
			this.showGameOver();
			return;
		}
		this.loadQuestionAtIndex(this.currentIndex + 1);
	}

	private loadPreviousQuestion(): void {
		if (this.currentIndex === 0) return;

		const prevIdx = this.currentIndex - 1;
		this.loadQuestionAtIndex(prevIdx);   // fixed: correct index applied BEFORE rendering
	}

	// --------------------------------------------------------
	// ANSWER HANDLING
	// --------------------------------------------------------
	private handleAnswer(userInput: string): void {
		const entry = this.history[this.currentIndex];
		if (!entry || entry.completed) return;

		// Save answer
		entry.userAnswer = userInput;

		const match = /^0?(\d{1,2}):(\d{2})$/.exec(userInput);
		if (!match) {
			this.showFeedback('Please enter a valid time like 14:30', false);
			return;
		}

		const userHour = parseInt(match[1], 10);
		const userMinute = parseInt(match[2], 10);
		const correctHour = entry.data.correctHour;
		const correctMinute = entry.data.correctMinute;

		const isCorrect = userHour === correctHour && userMinute === correctMinute;
		entry.attempts++;
		this.model.attempts = entry.attempts;
		this.updateAttemptIndicator();

		if (isCorrect) {
			this.showFeedback('Correct!', true);
			entry.completed = true;
			this.model.correctAnswers++;
			this.animateClockTo(correctHour, correctMinute);
		} else if (entry.attempts < this.model.maxAttempts) {
			const remaining = this.model.maxAttempts - entry.attempts;
			this.showFeedback(
				`Try again! You have ${remaining} attempt${remaining > 1 ? 's' : ''} left.`,
				false
			);
		} else {
			entry.completed = true;
			this.showFeedback(
				`Out of attempts! The correct time was ${this.formatTime(correctHour, correctMinute)}.`,
				true
			);
			this.animateClockTo(correctHour, correctMinute);
		}

		this.history[this.currentIndex] = entry;
	}

	// --------------------------------------------------------
	// VISUAL HELPERS
	// --------------------------------------------------------
	private renderQuestion(q: ReturnType<typeof generateTimeQuestion>): void {
		this.questionText.text(`Q${this.currentIndex + 1}: ${q.question}`);
		this.questionText.offsetX(this.questionText.width() / 2);
	}

	private updateAttemptIndicator(): void {
		this.attemptsIndicator.text(`Attempts: ${this.model.attempts} / ${this.model.maxAttempts}`);
		this.attemptsIndicator.offsetX(this.attemptsIndicator.width() / 2);
		this.view.getGroup().getLayer()?.batchDraw();
	}

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

		this.nextButtonGroup.visible(allowNext);
		this.view.getGroup().getLayer()?.batchDraw();
	}

	private clearFeedback(): void {
		const feedback = this.view.getGroup().findOne('#feedbackText');
		if (feedback) feedback.destroy();
	}

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

	private showGameOver(): void {
		this.clearFeedback();

		const box = new Konva.Rect({
			x: STAGE_WIDTH / 2 - 250,
			y: STAGE_HEIGHT / 2 - 60,
			width: 500,
			height: 120,
			fill: 'white',
			opacity: 0.85,
			cornerRadius: 15,
		});
		this.view.getGroup().add(box);

		const text = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: STAGE_HEIGHT / 2,
			text: `You completed all ${this.model.totalQuestions} questions!\nScore: ${this.model.correctAnswers}/${this.model.totalQuestions}`,
			fontSize: 26,
			fontFamily: 'Arial',
			fill: 'black',
			align: 'center',
		});
		text.offsetX(text.width() / 2);
		text.offsetY(text.height() / 2);
		this.view.getGroup().add(text);

		if (this.inputBox) this.inputBox.disabled = true;
	}

	private formatTime(hour: number, minute: number): string {
		return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
	}

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