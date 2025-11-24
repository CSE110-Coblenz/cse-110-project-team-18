import { ScreenController } from '../../types';
import type { ScreenSwitcher } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { MercuryGameView } from './MercuryGameView';
import { MercuryGameModel } from './MercuryGameModel';

type MercuryPhase = 'main' | 'mainSummary' | 'challengeIntro' | 'challenge' | 'challengeSummary';

/**
 * MercuryGameController class handles screen switcher,
 * displays, and inputs
 */
export class MercuryGameController extends ScreenController {
	private readonly screenSwitcher: ScreenSwitcher;
	private readonly view: MercuryGameView;
	private readonly model: MercuryGameModel;
	private phase: MercuryPhase = 'main';
	private challengeTimerMs = 0;
	private readonly challengeDurationMs = 5000;
	private readonly challengeQuestionCount = 5;
	private lastSummary?:
		| {
				correct: number;
				total: number;
				minToWin: number;
				passed: boolean;
				phase: 'main' | 'challenge';
		  }
		| undefined;
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
		this.startMainGame();
	}

	/**
	 * hide view
	 * remove the input box
	 */
	override hide(): void {
		super.hide();
		this.removeInputBox();
		this.view.hideModal();
		this.view.hideTimer();
	}

	/**
	 * default is empty
	 */
	update(deltaTimeMs: number): void {
		if (this.phase === 'challenge' && this.model.hasMoreQuestions()) {
			if (this.challengeTimerMs > 0) {
				this.challengeTimerMs = Math.max(0, this.challengeTimerMs - deltaTimeMs);
				this.updateTimerLabel();
				if (this.challengeTimerMs <= 0) {
					this.handleChallengeTimeout();
				}
			}
		}
	}

	/**
	 * handle return to menu's button that returns to menu
	 * screen when clicked
	 */
	private handleReturnToMenuClick(): void {
		this.screenSwitcher.switchToScreen({ type: 'menu' });
	}

	/**
	 * reset state and launch the main (untimed) quiz flow
	 */
	private startMainGame(): void {
		this.phase = 'main';
		this.model.reset();
		this.lastSummary = undefined;
		this.view.setSubmitLabel('SUBMIT');
		this.view.hideModal();
		this.view.hideTimer();
		this.view.setReturnButtonVisible(true);
		this.ensureInputBox();
		this.view.showMessage('');
		this.view.updateCorrectCount(0);
		this.presentCurrentQuestion();
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
		this.setInputVisible(true);
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
	public setInputVisible(isVisible: boolean): void {
		if (!this.inputBox) return;
		this.inputBox.style.display = isVisible ? 'block' : 'none';
	}

	/**
	 * show the next question or finish the current phase
	 */
	private presentCurrentQuestion(): void {
		if (!this.model.hasMoreQuestions()) {
			this.handlePhaseComplete();
			return;
		}

		const question = this.model.getCurrentQuestion();
		if (question === undefined) return;

		this.view.displayQuestion(
			this.model.getCurrentQuestionIndex(),
			this.model.getTotalQuestions(),
			`${question.text} = ?`,
			this.model.getCorrectAnswers()
		);

		if (this.phase === 'challenge') {
			this.challengeTimerMs = this.challengeDurationMs;
			this.updateTimerLabel();
		} else {
			this.view.hideTimer();
		}

		this.focusInput();
	}

	/**
	 * refresh the countdown label during the timed challenge
	 */
	private updateTimerLabel(): void {
		const secondsLeft = Math.max(0, this.challengeTimerMs) / 1000;
		this.view.updateTimer(`Time left: ${secondsLeft.toFixed(1)}s`);
	}

	/**
	 * handle the given answer
	 */
	private handleSubmitAnswer(): void {
		if (this.phase === 'mainSummary') {
			if (this.lastSummary?.passed) {
				this.startChallengeIntro();
			} else {
				this.startMainGame();
			}
			return;
		}

		if (this.phase === 'challengeIntro') {
			this.startChallengeGame();
			return;
		}

		if (this.phase === 'challengeSummary') {
			if (this.lastSummary?.passed) {
				this.screenSwitcher.switchToScreen({ type: 'menu' });
			} else {
				this.startChallengeGame();
			}
			return;
		}

		if (this.inputBox === null) return;

		if (!this.model.hasMoreQuestions()) {
			this.view.showMessage('All questions answered! Review your summary.');
			return;
		}

		if (this.phase === 'challenge' && this.challengeTimerMs <= 0) {
			return;
		}

		const rawInput = this.inputBox.value.trim();
		if (rawInput.length === 0) {
			this.view.showMessage('Please enter a number before submitting.', '#FBBF24');
			this.focusInput();
			return;
		}

		const parsedAnswer = Number(rawInput);
		if (!Number.isFinite(parsedAnswer)) {
			this.view.showMessage('Answers need to be numbers.', '#F87171');
			this.focusInput();
			return;
		}

		const question = this.model.getCurrentQuestion();
		if (question === undefined) return;
		const result = this.model.submitAnswer(parsedAnswer);

		this.view.displayResult(result.isCorrect, question.text, result.correctAnswer);
		this.view.updateCorrectCount(this.model.getCorrectAnswers());
		this.inputBox.value = '';

		if (this.phase === 'challenge') {
			this.challengeTimerMs = 0;
			this.view.hideTimer();
		}

		this.scheduleNextStep();
	}

	/**
	 * move to the next question or end-of-phase summary
	 */
	private scheduleNextStep(): void {
		if (this.model.hasMoreQuestions()) {
			window.setTimeout(() => this.presentCurrentQuestion(), 900);
		} else {
			this.handlePhaseComplete();
		}
	}

	/**
	 * route completion to the appropriate handler for the active phase
	 */
	private handlePhaseComplete(): void {
		if (this.phase === 'main') {
			this.handleMainComplete();
		} else if (this.phase === 'challenge') {
			this.handleChallengeComplete();
		}
	}

	/**
	 * finalize the main game, show summary, and offer retry/challenge
	 */
	private handleMainComplete(): void {
		const summary = this.model.getSummary();
		const passed = summary.correctAnswers >= summary.minNumberOfQuestionsToWin;
		this.lastSummary = {
			correct: summary.correctAnswers,
			total: summary.totalQuestions,
			minToWin: summary.minNumberOfQuestionsToWin,
			passed,
			phase: 'main',
		};

		this.view.displaySummary(
			summary.correctAnswers,
			summary.totalQuestions,
			summary.minNumberOfQuestionsToWin
		);
		this.view.hideTimer();
		this.removeInputBox();
		this.phase = 'mainSummary';
		this.view.setSubmitLabel(passed ? 'CHALLENGE' : 'RETRY');
		this.view.showMessage(
			passed ? 'Ready for a 5-second speed round?' : 'Score under 80%. Tap retry to try again.',
			passed ? '#A7F3D0' : '#FBBF24'
		);
	}

	/**
	 * show one-page intro before starting the timed challenge
	 */
	private startChallengeIntro(): void {
		this.phase = 'challengeIntro';
		this.view.showModal(
			'Timed mini-mission: 5 seconds per question.\nAnswer quickly to keep pace.\nPress Start to begin.'
		);
		this.view.setSubmitLabel('START CHALLENGE');
		this.view.hideTimer();
	}

	/**
	 * start the timed challenge run with a shorter question set
	 */
	private startChallengeGame(): void {
		this.phase = 'challenge';
		this.view.hideModal();
		this.model.reset(this.challengeQuestionCount);
		this.lastSummary = undefined;
		this.challengeTimerMs = 0;
		this.ensureInputBox();
		this.view.setSubmitLabel('SUBMIT');
		this.view.showMessage('');
		this.view.updateCorrectCount(0);
		this.presentCurrentQuestion();
	}

	/**
	 * auto-mark incorrect if the timer hits zero mid-challenge
	 */
	private handleChallengeTimeout(): void {
		if (this.phase !== 'challenge') return;
		const question = this.model.getCurrentQuestion();
		if (!question) return;
		const result = this.model.submitAnswer(Number.NaN);
		this.view.displayResult(false, question.text, result.correctAnswer);
		this.view.updateCorrectCount(this.model.getCorrectAnswers());
		if (this.inputBox) this.inputBox.value = '';
		this.challengeTimerMs = 0;
		this.scheduleNextStep();
	}

	/**
	 * wrap up the challenge, adjust button labels, and offer retry/menu
	 */
	private handleChallengeComplete(): void {
		const summary = this.model.getSummary();
		const passed = summary.correctAnswers >= summary.minNumberOfQuestionsToWin;
		this.lastSummary = {
			correct: summary.correctAnswers,
			total: summary.totalQuestions,
			minToWin: summary.minNumberOfQuestionsToWin,
			passed,
			phase: 'challenge',
		};
		this.view.displaySummary(
			summary.correctAnswers,
			summary.totalQuestions,
			summary.minNumberOfQuestionsToWin
		);
		this.view.hideTimer();
		this.removeInputBox();
		this.phase = 'challengeSummary';
		this.view.setSubmitLabel(passed ? 'GO TO MENU' : 'RETRY');
		this.view.setReturnButtonVisible(false);
		this.view.showMessage(
			passed
				? 'Challenge complete! Returning to the menu.'
				: 'Missed the target. Retry the speed round?',
			passed ? '#A7F3D0' : '#FBBF24'
		);
	}
}
