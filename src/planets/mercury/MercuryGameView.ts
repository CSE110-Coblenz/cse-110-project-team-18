import Konva from 'konva';
import type { View } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { createButton } from '../../ui';

/**
 * MercuryGameView renders the UI for the Mercury math challenge.
 */
export class MercuryGameView implements View {
	private group: Konva.Group;
	private progressLabel: Konva.Text;
	private questionLabel: Konva.Text;
	private feedbackLabel: Konva.Text;
	private summaryLabel: Konva.Text;

	/**
	 * constructor designs the background, buttons, textbox, texts
	 * 
	 * @param onSubmitAnswer move to next question
	 * @param onReturnToMenu move out to menu
	*/
	constructor(onSubmitAnswer: () => void, onReturnToMenu: () => void) {
		this.group = new Konva.Group({
			visible: false,
			id: 'mercuryGameScreen',
		});

		const background = new Konva.Rect({
			x: 0,
			y: 0,
			width: STAGE_WIDTH,
			height: STAGE_HEIGHT,
			fill: '#040D1A',
		});
		this.group.add(background);

		const title = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 80,
			width: STAGE_WIDTH - 120,
			text: 'Mercury Math Mission',
			align: 'center',
			fontSize: 48,
			fontFamily: 'Arial',
			fill: 'white',
		});
		title.offsetX((STAGE_WIDTH - 120) / 2);
		this.group.add(title);

		this.progressLabel = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 170,
			width: STAGE_WIDTH - 120,
			text: 'Question 1 of 10',
			align: 'center',
			fontSize: 26,
			fontFamily: 'Arial',
			fill: '#9FB3D1',
		});
		this.progressLabel.offsetX((STAGE_WIDTH - 120) / 2);
		this.group.add(this.progressLabel);

		this.questionLabel = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 230,
			width: STAGE_WIDTH - 160,
			text: 'Solve the equation to continue your mission.',
			align: 'center',
			fontSize: 36,
			fontFamily: 'Arial',
			fill: 'white',
		});
		this.questionLabel.offsetX((STAGE_WIDTH - 160) / 2);
		this.group.add(this.questionLabel);

		this.feedbackLabel = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 320,
			width: STAGE_WIDTH - 160,
			text: 'Type your answer below and press submit.',
			align: 'center',
			fontSize: 24,
			fontFamily: 'Arial',
			fill: '#C4D7FF',
		});
		this.feedbackLabel.offsetX((STAGE_WIDTH - 160) / 2);
		this.group.add(this.feedbackLabel);

		this.summaryLabel = new Konva.Text({
			x: STAGE_WIDTH / 2,
			y: 400,
			width: STAGE_WIDTH - 200,
			text: '',
			align: 'center',
			fontSize: 24,
			fontFamily: 'Arial',
			fill: '#FDE68A',
			visible: false,
		});
		this.summaryLabel.offsetX((STAGE_WIDTH - 200) / 2);
		this.group.add(this.summaryLabel);

		const submitButton = createButton({
			x: STAGE_WIDTH / 2 - 160,
			y: STAGE_HEIGHT - 160,
			width: 320,
			height: 60,
			text: 'SUBMIT ANSWER',
			colorKey: 'primary',
			hoverColorKey: 'primary_hover',
			onClick: onSubmitAnswer,
		});
		this.group.add(submitButton);

		const returnButton = createButton({
			x: 50,
			y: 50,
			width: 275,
			height: 60,
			text: 'RETURN TO MENU',
			colorKey: 'alien_green',
			hoverColorKey: 'success_hover',
			onClick: onReturnToMenu,
		});
		this.group.add(returnButton);
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
	 */
	public displayQuestion(
		questionIndex: number,
		totalQuestions: number,
		questionText: string
	): void {
		this.progressLabel.text(`Question ${questionIndex + 1} of ${totalQuestions}`);
		this.questionLabel.text(questionText);
		this.summaryLabel.visible(false);
		this.showMessage('Type your answer below and press submit.');
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
		const summary = `You answered ${correctAnswers} / ${maxNumberOfQuestions} correctly.\n${
			passed
				? 'You gathered enough data to leave Mercury!'
				: `Keep practicing until you reach ${minNumberOfQuestionsToWin}.`
		}`;
		this.summaryLabel.text(summary);
		this.summaryLabel.fill(passed ? '#4ADE80' : '#FCD34D');
		this.summaryLabel.visible(true);
		this.group.getLayer()?.batchDraw();
	}
}
