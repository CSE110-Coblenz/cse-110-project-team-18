import Konva from 'konva';
import type { View } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { theme } from '../../configs/ThemeConfig.ts';
import { createButton, setElementText } from '../../ui/factory/ElementFactory.ts';
import { preloadImage } from '../../core/utils/AssetLoader';

const FONT_FAMILY = 'Comic Sans MS, Arial, sans-serif';

/**
 * VenusGameView renders the UI for the Venus math challenge.
 * Layout mirrors Mercury's panel/counter placement but keeps Venus colors and guidance.
 */
export class VenusGameView implements View {
	private group: Konva.Group;

	private progressLabel: Konva.Text;
	private correctCountLabel: Konva.Text; // live correct counter for speed round
	private questionLabel: Konva.Text;
	private feedbackLabel: Konva.Text;
	private summaryLabel: Konva.Text;
	private submitButton: Konva.Group;
	private timerLabel: Konva.Text; // countdown for rapid-fire
	private modalGroup: Konva.Group; // intro overlay for rapid-fire
	private modalBody: Konva.Text;

	constructor(onSubmitAnswer: () => void) {
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

		const panelWidth = STAGE_WIDTH - 850;
		const panelHeight = 240;
		const panelX = (STAGE_WIDTH - panelWidth) / 2;
		const panelY = 200;
		const answerBoxTop = STAGE_HEIGHT - 230;

		// Title
		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 80,
			width: STAGE_WIDTH - 120,
			text: 'Escape from Venus',
			align: 'center',
			fontSize: 48,
			fontFamily: FONT_FAMILY,
			fill: 'rgba(255, 173, 94, 0.9)',
		});
		title.offsetX((STAGE_WIDTH - 120) / 2);
		this.group.add(title);

		// Panel for question/feedback (mirrors Mercury placement).
		const questionPanel = new Konva.Group({
			x: panelX,
			y: panelY,
		});

		const questionPanelBg = new Konva.Rect({
			width: panelWidth,
			height: panelHeight,
			fill: 'rgba(15, 23, 42, 0.75)',
			stroke: 'rgba(255, 173, 94, 0.6)',
			strokeWidth: 2.5,
			cornerRadius: 18,
		});
		questionPanel.add(questionPanelBg);

		this.progressLabel = new Konva.Text({
			x: 100,
			y: 16,
			width: panelWidth - 220,
			text: 'Question 1 of 10',
			align: 'center',
			fontSize: 26,
			fontFamily: FONT_FAMILY,
			fill: '#FFD8A0',
		});
		questionPanel.add(this.progressLabel);

		// Keep the correct counter aligned like Mercury's UI.
		this.correctCountLabel = new Konva.Text({
			x: panelWidth - 200,
			y: 16,
			width: 180,
			text: 'Correct: 0',
			align: 'right',
			fontSize: 20,
			fontFamily: FONT_FAMILY,
			fill: '#B7E5FF',
		});
		questionPanel.add(this.correctCountLabel);

		this.questionLabel = new Konva.Text({
			x: 20,
			y: panelHeight / 2 - 28,
			width: panelWidth - 40,
			text: 'Solve the equation to continue your mission.',
			align: 'center',
			fontSize: 36,
			fontFamily: FONT_FAMILY,
			fill: '#F6FBFF',
		});
		questionPanel.add(this.questionLabel);

		this.feedbackLabel = new Konva.Text({
			x: 20,
			y: panelHeight / 2 + 36,
			width: panelWidth - 40,
			text: 'Type your answer below and press submit.',
			align: 'center',
			fontSize: 24,
			fontFamily: FONT_FAMILY,
			fill: '#C8E7FF',
			lineHeight: 1.4,
		});
		questionPanel.add(this.feedbackLabel);

		this.group.add(questionPanel);

		// Timer above the panel (only visible during rapid fire).
		this.timerLabel = new Konva.Text({
			x: panelX + 20,
			y: panelY + 16,
			width: 200,
			text: '',
			align: 'left',
			fontSize: 20,
			fontFamily: FONT_FAMILY,
			fill: '#FFE6B3',
			visible: false,
		});
		this.group.add(this.timerLabel);

		// Summary label between the panel and the input bar.
		this.summaryLabel = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: panelY + panelHeight + (answerBoxTop - (panelY + panelHeight)) / 2,
			width: STAGE_WIDTH - 200,
			text: '',
			align: 'center',
			fontSize: 24,
			fontFamily: FONT_FAMILY,
			fill: '#FCD77F',
			visible: false,
			lineHeight: 1.2,
			letterSpacing: 1,
		});
		this.summaryLabel.offsetX((STAGE_WIDTH - 200) / 2);
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
			fontFamily: FONT_FAMILY,
			fill: '#F6FBFF',
		});
		this.modalGroup.add(modalTitle);

		this.modalBody = new Konva.Text({
			x: -340,
			y: -40,
			width: 680,
			text: '',
			align: 'center',
			fontSize: 24,
			fontFamily: FONT_FAMILY,
			fill: theme.get('asteroid_gray'),
			lineHeight: 2,
			letterSpacing: 1,
		});
		this.modalGroup.add(this.modalBody);

		this.group.add(this.modalGroup);
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
		this.progressLabel.text(`Question ${questionIndex + 1} of ${totalQuestions}`);
		this.questionLabel.text(questionText);
		this.summaryLabel.visible(false);
		if (typeof correctCount === 'number') {
			this.updateCorrectCount(correctCount); // surface live tally in rapid fire
		}

		this.showMessage('Type your answer below\nPress submit.', theme.get('info'));
		this.hideTimer();
		this.group.getLayer()?.batchDraw();
	}

	public showMessage(message: string, color?: string): void {
		this.feedbackLabel.text(message);
		this.feedbackLabel.fill(color || theme.get('info'));
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
		this.correctCountLabel.text(`Correct: ${correctCount}`);
		this.group.getLayer()?.batchDraw();
	}

	public updateTimer(text: string): void {
		// Countdown label used exclusively in the rapid-fire finale.
		this.timerLabel.text(text);
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

		this.summaryLabel.text(summary);
		this.summaryLabel.fill(passed ? theme.get('success') : theme.get('warning'));
		this.summaryLabel.visible(true);
		this.group.getLayer()?.batchDraw();
	}
}
