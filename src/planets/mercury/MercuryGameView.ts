import Konva from 'konva';
import type { View } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { createButton, setElementText } from '../../ui';
import { preloadImage } from '../../core/utils/AssetLoader';

const FONT_FAMILY = 'Comic Sans MS, Arial, sans-serif';

/**
 * MercuryGameView renders the UI for the Mercury math challenge.
 */
export class MercuryGameView implements View {
	private group: Konva.Group;
	private progressLabel: Konva.Text;
	private questionLabel: Konva.Text;
	private feedbackLabel: Konva.Text;
	private correctCountLabel: Konva.Text;
	private summaryLabel: Konva.Text;
	private submitButton: Konva.Group;
	private returnButton: Konva.Group;

	/**
	 * constructor designs the background, buttons, textbox, texts
	 *
	 * @param onSubmitAnswer move to next question
	 * @param onReturnToLevel move out to level selection
	 */
	constructor(onSubmitAnswer: () => void, onReturnToLevel: () => void) {
		this.group = new Konva.Group({
			visible: false,
			id: 'mercuryGameScreen',
		});

		const background = new Konva.Image({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			listening: false,
			image: new Image(),
		});

		void preloadImage('/assets/ui/MercuryBG.png').then((img) => {
			background.image(img);
			this.group.getLayer()?.batchDraw();
		});

		this.group.add(background);

		const panelWidth = STAGE_WIDTH - 1000;
		const panelHeight = 200;
		const panelX = (STAGE_WIDTH - panelWidth) / 2;
		const panelY = 250;
		const answerBoxTop = STAGE_HEIGHT - 230;

		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 80,
			width: STAGE_WIDTH - 120,
			text: 'Mercury Math Mission',
			align: 'center',
			fontSize: 48,
			fontFamily: FONT_FAMILY,
			fill: 'white',
		});
		title.offsetX((STAGE_WIDTH - 120) / 2);
		this.group.add(title);

		const questionPanel = new Konva.Group({
			x: panelX,
			y: panelY,
		});

		const questionPanelBg = new Konva.Rect({
			width: panelWidth,
			height: panelHeight,
			fill: 'rgba(15, 23, 42, 0.7)',
			stroke: 'rgba(255, 255, 255, 0.08)',
			strokeWidth: 2,
			cornerRadius: 18,
		});
		questionPanel.add(questionPanelBg);

		this.progressLabel = new Konva.Text({
			x: 100,
			y: 16,
			width: panelWidth - 220,
			text: 'Question 1',
			align: 'center',
			fontSize: 26,
			fontFamily: FONT_FAMILY,
			fill: '#C7D7F9',
		});
		questionPanel.add(this.progressLabel);

		this.correctCountLabel = new Konva.Text({
			x: panelWidth - 200,
			y: 16,
			width: 180,
			text: 'Correct: 0',
			align: 'right',
			fontSize: 20,
			fontFamily: FONT_FAMILY,
			fill: '#AFC8F3',
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
			fill: 'white',
		});
		questionPanel.add(this.questionLabel);

		this.feedbackLabel = new Konva.Text({
			x: 20,
			y: panelHeight / 2 + 36,
			width: panelWidth - 40,
			text: '',
			align: 'center',
			fontSize: 24,
			fontFamily: FONT_FAMILY,
			fill: '#C4D7FF',
		});
		questionPanel.add(this.feedbackLabel);

		this.group.add(questionPanel);

		this.summaryLabel = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: panelY + panelHeight + (answerBoxTop - (panelY + panelHeight)) / 2,
			width: STAGE_WIDTH - 200,
			text: '',
			align: 'center',
			fontSize: 24,
			fontFamily: FONT_FAMILY,
			fill: '#FDE68A',
			visible: false,
			lineHeight: 1.1,
			letterSpacing: 1,
		});
		this.summaryLabel.offsetX((STAGE_WIDTH - 200) / 2);
		this.group.add(this.summaryLabel);

		this.submitButton = createButton({
			x: STAGE_WIDTH / 2 - 160,
			y: STAGE_HEIGHT - 160,
			width: 320,
			height: 60,
			text: 'SUBMIT',
			colorKey: 'primary',
			hoverColorKey: 'primary_hover',
			onClick: onSubmitAnswer,
		});
		this.group.add(this.submitButton);

		this.returnButton = createButton({
			x: 50,
			y: 50,
			width: 275,
			height: 60,
			text: 'RETURN TO LEVEL',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onReturnToLevel,
		});
		this.group.add(this.returnButton);
	}

	/**
	 * get group returns konva group contains all Mercury screen nodes
	 *
	 * @returns konva group containing all Mercury screen nodes
	 */
	getGroup(): Konva.Group {
		return this.group;
	}

	/**
	 * show/hide the return button (used after mini-game)
	 */
	public setReturnButtonVisible(isVisible: boolean): void {
		this.returnButton.visible(isVisible);
		this.returnButton.listening(isVisible);
		this.group.getLayer()?.batchDraw();
	}

	/**
	 * set group visible and trigger a layer redraw
	 */
	show(): void {
		this.group.visible(true);
		this.group.getLayer()?.batchDraw();
	}

	/**
	 * set group invisible and hide the screen
	 */
	hide(): void {
		this.group.visible(false);
		this.group.getLayer()?.batchDraw();
	}

	/**
	 * display current question
	 *
	 * @param questionIndex the index of current question
	 * @param totalQuestions the max number of questions played
	 * @param questionText the question as text
	 * @param correctCount the number of correct answers so far
	 */
	public displayQuestion(
		questionIndex: number,
		_totalQuestions: number,
		questionText: string,
		correctCount: number
	): void {
		this.progressLabel.text(`Question ${questionIndex + 1}`);
		this.questionLabel.text(questionText);
		this.updateCorrectCount(correctCount);
		this.summaryLabel.visible(false);
		this.showMessage('');
		this.group.getLayer()?.batchDraw();
	}

	/**
	 * display message telling user whether they input anything correctly or not,
	 * the answer given is correct or not
	 *
	 * @param message string of message wanted to display
	 * @param color the color of the message with default of white
	 */
	public showMessage(message: string, color: string = '#C4D7FF'): void {
		this.feedbackLabel.text(message);
		this.feedbackLabel.fill(color);
		this.group.getLayer()?.batchDraw();
	}

	/**
	 * update the label that shows how many correct answers the player has
	 */
	public updateCorrectCount(correctCount: number): void {
		this.correctCountLabel.text(`Correct: ${correctCount}`);
		this.group.getLayer()?.batchDraw();
	}

	/**
	 * update submit button label
	 */
	public setSubmitLabel(text: string): void {
		setElementText(this.submitButton, text);
		this.group.getLayer()?.batchDraw();
	}

	/**
	 * display result after every question
	 *
	 * @param isCorrect determine whether the answer is correct or not
	 * @param questionText the question as text for displaying
	 * @param answerText the answer as text for displaying
	 */
	public displayResult(isCorrect: boolean, questionText: string, answerText: number): void {
		const color = isCorrect ? '#4ADE80' : '#F87171';
		const message = isCorrect
			? 'Correct! Nice work!'
			: `Incorrect. ${questionText} = ${answerText}`;
		this.showMessage(message, color);
	}

	/**
	 * display summary after completing the game
	 *
	 * @param correctAnswers the number of correct answers the player achieved
	 * @param maxNumberOfQuestions the max number of questions played
	 * @param minNumberOfQuestionsToWin the min number of correct questions needed
	 * to complete the mercury game
	 */
	public displaySummary(
		correctAnswers: number,
		maxNumberOfQuestions: number,
		minNumberOfQuestionsToWin: number
	): void {
		const passed = correctAnswers >= minNumberOfQuestionsToWin;
		const summary = `You answered ${correctAnswers} / ${maxNumberOfQuestions} correctly.\n\n${
			passed
				? 'Ready to challenge Venus!'
				: `Keep practicing until you reach ${minNumberOfQuestionsToWin}.`
		}`;
		this.summaryLabel.text(summary);
		this.summaryLabel.fill(passed ? '#4ADE80' : '#FCD34D');
		this.summaryLabel.visible(true);
		this.group.getLayer()?.batchDraw();
	}
}
