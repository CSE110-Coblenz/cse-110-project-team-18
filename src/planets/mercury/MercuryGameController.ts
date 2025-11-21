import { ScreenController } from '../../types';
import type { ScreenSwitcher } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { MercuryGameView } from './MercuryGameView';
import { MercuryGameModel } from './MercuryGameModel';

/**
 * MercuryGameController class handles screen switcher,
 * displays, and inputs
 */
export class MercuryGameController extends ScreenController {
	private readonly screenSwitcher: ScreenSwitcher;
	private readonly view: MercuryGameView;
	private readonly model: MercuryGameModel;
	private inputBox: HTMLInputElement | null = null;

	/**
	 * constructor inherits from Screen Controller and initializes
	 * screen switcher, view, and model
	 *
	 * @param screenSwitcher used to switch between screens
	 */
	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new MercuryGameModel();
		this.view = new MercuryGameView(
			() => this.handleSubmitAnswer(),
			() => this.handleReturnToMenuClick()
		);
	}

	/**
	 * get view from Mercury Game View
	 *
	 * @returns the view of Mercury Game View
	 */
	getView(): MercuryGameView {
		return this.view;
	}

	/**
	 * show view from Mercury Game View
	 * reset model when called
	 * create an input box for answers
	 * get the current question from model
	 */
	override show(): void {
		super.show();
		this.model.reset();
		this.ensureInputBox();
		this.presentCurrentQuestion();
	}

	/**
	 * hide view
	 * remove the input box
	 */
	override hide(): void {
		super.hide();
		this.removeInputBox();
	}

	/**
	 * default is empty
	 */
	update(_deltaTime: number): void {
		// no per-frame updates needed
	}

	/**
	 * handle return to menu's button that returns to menu
	 * screen when clicked
	 */
	private handleReturnToMenuClick(): void {
		this.screenSwitcher.switchToScreen({ type: 'menu' });
	}

	/**
	 * create styled text box input
	 */
	private ensureInputBox(): void {
		if (this.inputBox !== null) {
			this.inputBox.value = '';
			this.focusInput();
			return;
		}

		const container = document.getElementById('container');
		if (container === null) return;

		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = 'Enter your answer';
		Object.assign(input.style, {
			position: 'absolute',
			width: '320px',
			padding: '12px',
			fontSize: '20px',
			border: '2px solid white',
			borderRadius: '10px',
			background: '#1f2937',
			color: 'white',
			textAlign: 'center',
			left: `${STAGE_WIDTH / 2 - 160}px`,
			top: `${STAGE_HEIGHT - 230}px`,
			zIndex: '10',
		});

		container.style.position = 'relative';
		container.appendChild(input);
		input.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				this.handleSubmitAnswer();
			}
		});

		this.inputBox = input;
		this.focusInput();
	}

	/**
	 * put cursor into the input box automatically
	 */
	private focusInput(): void {
		this.inputBox?.focus();
	}

	/**
	 * remove input box when switching to another screens
	 */
	private removeInputBox(): void {
		if (!this.inputBox) return;
		this.inputBox.remove();
		this.inputBox = null;
	}

	/**
	 * get the current question from model and send it to view
	 */
	private presentCurrentQuestion(): void {
		if (!this.model.hasMoreQuestions()) return;

		const question = this.model.getCurrentQuestion();
		if (question === undefined) return;

		this.view.displayQuestion(
			this.model.getCurrentQuestionIndex(),
			this.model.getTotalQuestions(),
			`${question.text} = ?`
		);

		this.focusInput();
	}

	/**
	 * handle the given answer
	 */
	private handleSubmitAnswer(): void {
		if (this.inputBox === null) return;

		// finish the game
		if (!this.model.hasMoreQuestions()) {
			this.view.showMessage('All questions answered! Review your summary.');
			return;
		}

		// check if any inputs are typed
		const rawInput = this.inputBox.value.trim();
		if (rawInput.length === 0) {
			this.view.showMessage('Please enter a number before submitting.', '#FBBF24');
			this.focusInput();
			return;
		}

		// check if inputs are numbers
		const parsedAnswer = Number(rawInput);
		if (!Number.isFinite(parsedAnswer)) {
			this.view.showMessage('Answers need to be numbers.', '#F87171');
			this.focusInput();
			return;
		}

		// get question
		const question = this.model.getCurrentQuestion();
		// check answer for correctness
		if (question === undefined) return;
		const result = this.model.submitAnswer(parsedAnswer);

		// display result
		this.view.displayResult(result.isCorrect, question.text, result.correctAnswer);
		this.inputBox.value = '';

		// move to next question or display summary screen after finishing
		// the set of questions
		if (this.model.hasMoreQuestions()) {
			window.setTimeout(() => this.presentCurrentQuestion(), 1200);
		} else {
			const summary = this.model.getSummary();
			this.view.displaySummary(
				summary.correctAnswers,
				summary.totalQuestions,
				summary.minNumberOfQuestionsToWin
			);
			this.removeInputBox();
		}
	}
}
