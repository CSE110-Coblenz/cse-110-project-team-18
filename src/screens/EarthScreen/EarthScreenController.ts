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

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.view = new EarthScreenView();
		this.model = new EarthScreenModel();
		this.logic = new EarthLogic(this.view.getGroup());
		this.logic.initializeClock();

		// Question text
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

		// Attempts indicator
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

		// Previous Question button (below feedback)
		this.previousButtonGroup = new Konva.Group({
			x: STAGE_WIDTH / 2 - 100,
			y: STAGE_HEIGHT / 2 + 290,
			visible: true,
		});

		const prevRect = new Konva.Rect({
			width: 200,
			height: 50,
			fill: '#444',
			cornerRadius: 10,
			stroke: 'white',
			strokeWidth: 2,
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
		this.previousButtonGroup.on('click', () => {
			alert('Previous question clicked (test)');
		});
		this.view.getGroup().add(this.previousButtonGroup);

		// Back to Menu button (bottom-left)
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

		// Start first question
		this.loadNewQuestion();
	}

	// --------------------------------------------------------
	// INPUT BOX
	// --------------------------------------------------------
	private createInputBox(): void {
		this.removeInputBox();

		const container = document.getElementById('container');
		if (!container) return;

		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = 'Enter your answer (e.g. 12:30 PM)';
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
				input.value = ''; // clear input
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
		this.clearFeedback();

		if (this.model.currentQuestion >= this.model.totalQuestions) {
			this.showGameOver();
			return;
		}
		// Increment question counter and load a new question
		const q = generateTimeQuestion();

		this.model.correctHour = q.correctHour;
		this.model.correctMinute = q.correctMinute;
		this.model.attempts = 0;

		const questionNumber = this.model.currentQuestion + 1;

		// Show "Q1: It is 3:30..." properly centered
		this.questionText.text(`Q${this.model.currentQuestion}: ${q.question}`);
		this.questionText.offsetX(this.questionText.width() / 2);

		this.logic.setClockTime(q.startHour, q.startMinute);
		this.updateAttemptIndicator();
		this.view.getGroup().getLayer()?.batchDraw();

		this.model.currentQuestion++;
	}

	// --------------------------------------------------------
	// GAME OVER MESSAGE (place this after loadNewQuestion)
	// --------------------------------------------------------
	private showGameOver(): void {
		this.clearFeedback();

		const finalText = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: STAGE_HEIGHT / 2,
			text: `🎉 You completed all ${this.model.totalQuestions} questions!\nScore: ${this.model.correctAnswers}/${this.model.totalQuestions}`,
			fontSize: 28,
			fontFamily: 'Arial',
			fill: 'lightgreen',
			align: 'center',
		});
		finalText.offsetX(finalText.width() / 2);
		this.view.getGroup().add(finalText);
		this.view.getGroup().getLayer()?.batchDraw();

		if (this.inputBox) this.inputBox.disabled = true;
	}

	private handleAnswer(userInput: string): void {
		const match = /^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/.exec(userInput);
		if (!match) {
			this.showFeedback('❌ Please enter a valid time like 12:30 PM');
			return;
		}

		const userHour = parseInt(match[1], 10) % 12;
		const userMinute = parseInt(match[2], 10);
		const { correctHour, correctMinute, maxAttempts } = this.model;

		this.model.attempts += 1;
		this.updateAttemptIndicator();

		const isCorrect = userHour === correctHour && userMinute === correctMinute;

		if (isCorrect) {
			this.showFeedback('✅ Correct!');
			this.animateClockTo(correctHour, correctMinute);
			this.model.correctAnswers++;
			this.model.attempts = 0;
			setTimeout(() => this.loadNewQuestion(), 1500);
		} else if (this.model.attempts < maxAttempts) {
			const remaining = maxAttempts - this.model.attempts;
			this.showFeedback(
				`❌ Try again! You have ${remaining} attempt${remaining > 1 ? 's' : ''} left.`
			);
		} else {
			this.showFeedback(`❌ Out of attempts!`);
			this.animateClockTo(correctHour, correctMinute);
			setTimeout(() => this.loadNewQuestion(), 2000);
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

	private showFeedback(message: string): void {
		const old = this.view.getGroup().findOne('#feedbackText');
		if (old) old.destroy();

		const feedback = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: STAGE_HEIGHT / 2 + 230, // moved slightly up to fit button
			text: message,
			fontSize: 26,
			fontFamily: 'Arial',
			fill: message.startsWith('✅') ? 'lightgreen' : 'red',
			id: 'feedbackText',
		});
		feedback.offsetX(feedback.width() / 2);
		this.view.getGroup().add(feedback);
		this.view.getGroup().getLayer()?.batchDraw();
	}

	private clearFeedback(): void {
		const feedback = this.view.getGroup().findOne('#feedbackText');
		if (feedback) feedback.destroy();
		this.view.getGroup().getLayer()?.batchDraw();
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
