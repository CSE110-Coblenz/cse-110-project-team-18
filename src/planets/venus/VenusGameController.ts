import { ScreenController } from '../../types';
import type { ScreenSwitcher } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../configs/GameConfig';
import { VenusGameView } from './VenusGameView';
import { VenusGameModel } from './VenusGameModel';
import { theme } from '../../configs/ThemeConfig.ts';
import { ProgressManager } from '../../core/managers/ProgressManager';

/* ---------------- Rapid-fire Game Modified ---------------- */
// add phases
type VenusPhase = 'main' | 'mainSummary' | 'challengeIntro' | 'challenge' | 'challengeSummary';
/* ---------------- End Rapid-fire Game Modified ---------------- */

export class VenusGameController extends ScreenController {
	private readonly screenSwitcher: ScreenSwitcher;
	private readonly view: VenusGameView;
	private readonly model: VenusGameModel;
	private inputBox: HTMLInputElement | null = null;
	/* ---------------- Rapid-fire Game Modified ---------------- */
	// These fields drive the Venus timed finale that unlocks after
	// the main round: we track the current phase, per-question timer,
	// duration, and shorter question count for the speed round.
	private phase: VenusPhase = 'main';
	private challengeTimerMs = 0;
	private readonly challengeDurationMs = 15000;
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
	/* ---------------- End Rapid-fire Game Modified ---------------- */

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;
		this.model = new VenusGameModel();
		this.view = new VenusGameView(
			() => this.handleSubmitAnswer(),
			() => this.handleReturnToLevelClick()
		);
	}

	getView(): VenusGameView {
		return this.view;
	}

	override show(): void {
		super.show();
		/* ---------------- Rapid-fire Game Modified ---------------- */
		// start the main game
		this.startMainGame();
		/* ---------------- End Rapid-fire Game Modified ---------------- */
	}

	override hide(): void {
		super.hide();
		this.removeInputBox();
		/* ---------------- Rapid-fire Game Modified ---------------- */
		// hide the time and pop-up dialog before the rapid game game starts
		this.view.hideModal();
		this.view.hideTimer();
		/* ---------------- End Rapid-fire Game Modified ---------------- */
	}

	/* ---------------- Rapid-fire Game Modified ---------------- */
	/**
	 * update the time countdown for rapid fire game, if time is 0,
	 * the question is automatically submitted with incorrect answer.
	 *
	 * @param deltaTimeMs the elapsed time since the update() is called
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
	 * update the timer label in view
	 */
	private updateTimerLabel(): void {
		const secondsLeft = Math.max(0, this.challengeTimerMs) / 1000;
		this.view.updateTimer(`Time left: ${secondsLeft.toFixed(1)}s`);
	}

	/**
	 * handle challenge timeout by submitting the incorrect answer and
	 * update current view
	 */
	private handleChallengeTimeout(): void {
		// Auto-mark incorrect if time expires mid-rapid-fire question.
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
	/* ---------------- End Rapid-fire Game Modified ---------------- */

	private handleReturnToLevelClick(): void {
		this.screenSwitcher.switchToScreen({ type: 'level selection' });
	}

	private ensureInputBox(): void {
		if (this.inputBox) {
			this.inputBox.value = '';
			this.focusInput();
			return;
		}

		const container = document.getElementById('container');
		if (!container) return;

		const input = document.createElement('input');
		input.type = 'text';
		input.placeholder = 'Enter your answer';

		Object.assign(input.style, {
			position: 'absolute',
			width: '320px',
			padding: '12px',
			fontSize: '20px',
			borderRadius: '10px',
			textAlign: 'center',
			zIndex: '10',
			left: `${STAGE_WIDTH / 2 - 160}px`,
			top: `${STAGE_HEIGHT - 230}px`,

			background: '#1f2937',
			color: 'white',
			border: '2px solid white',
		});

		input.style.outline = 'none';

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

	private focusInput(): void {
		this.inputBox?.focus();
	}

	private removeInputBox(): void {
		if (!this.inputBox) return;
		this.inputBox.remove();
		this.inputBox = null;
	}

	private presentCurrentQuestion(): void {
		/* ---------------- Rapid-fire Game Modified ---------------- */
		// check if main game/rapid-fire game still have questions
		if (!this.model.hasMoreQuestions()) {
			this.handlePhaseComplete();
			return;
		}
		/* ---------------- End Rapid-fire Game Modified ---------------- */
		const question = this.model.getCurrentQuestion();
		if (!question) return;
		this.view.displayQuestion(
			this.model.getCurrentQuestionIndex(),
			this.model.getTotalQuestions(),
			`${question.text} = ?`,
			/* ---------------- Rapid-fire Game Modified ---------------- */
			// get the number of correct answers
			this.model.getCorrectAnswers()
		);
		/* ---------------- Rapid-fire Game Modified ---------------- */
		// If we're in rapid fire, restart the per-question timer.
		if (this.phase === 'challenge') {
			this.challengeTimerMs = this.challengeDurationMs;
			this.updateTimerLabel();
		} else {
			this.view.hideTimer();
		}
		/* ---------------- End Rapid-fire Game Modified ---------------- */
		this.focusInput();
	}

	private handleSubmitAnswer(): void {
		/* ---------------- Rapid-fire Game Modified ---------------- */
		// check phases
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
				this.screenSwitcher.switchToScreen({ type: 'earth' });
			} else {
				this.startChallengeGame();
			}
			return;
		}

		if (!this.inputBox) return; // NOT in the modification
		if (this.phase === 'challenge' && this.challengeTimerMs <= 0) {
			return;
		}
		/* ---------------- End Rapid-fire Game Modified ---------------- */
		if (!this.model.hasMoreQuestions()) {
			this.view.showMessage('All questions answered! Review your summary.');
			return;
		}

		const rawInput = this.inputBox.value.trim();
		if (rawInput.length === 0) {
			this.view.showMessage('Please enter a number before submitting.', theme.get('warning'));
			this.focusInput();
			return;
		}

		const parsedAnswer = Number(rawInput);
		if (!Number.isFinite(parsedAnswer)) {
			this.view.showMessage('Answers need to be numbers.', theme.get('error'));
			this.focusInput();
			return;
		}

		const question = this.model.getCurrentQuestion();
		if (!question) return;
		const result = this.model.submitAnswer(parsedAnswer);

		this.view.displayResult(result.isCorrect, question.text, result.correctAnswer);
		/* ---------------- Rapid-fire Game Modified ---------------- */
		// send the correct answers' count to view for updating
		this.view.updateCorrectCount(this.model.getCorrectAnswers());
		/* ---------------- End Rapid-fire Game Modified ---------------- */
		this.inputBox.value = '';
		/* ---------------- Rapid-fire Game Modified ---------------- */
		// handle submit answer in rapid fire game
		if (this.phase === 'challenge') {
			this.challengeTimerMs = 0;
			this.view.hideTimer();
		}
		// set delay time between questions
		this.scheduleNextStep();
		/* ---------------- End Rapid-fire Game Modified ---------------- */
	}

	/* ---------------- Rapid-fire Game Modified ---------------- */
	/**
	 * start main game separating from rapid fire game
	 */
	private startMainGame(): void {
		// Reset into the untimed main flow before the rapid-fire unlock.
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
	 * handle the next step, present next question and run delay time
	 * or handle phase complete
	 */
	private scheduleNextStep(): void {
		if (this.model.hasMoreQuestions()) {
			window.setTimeout(() => this.presentCurrentQuestion(), 900);
		} else {
			this.handlePhaseComplete();
		}
	}

	/**
	 * handle phase complete decides whether main phase or challenge phase
	 * is completed to call the correct handler
	 */
	private handlePhaseComplete(): void {
		if (this.phase === 'main') {
			this.handleMainComplete();
		} else if (this.phase === 'challenge') {
			this.handleChallengeComplete();
		}
	}

	/**
	 * handle main completion: display summary screen, decide whether players
	 * can go to rapid fire game or retry the Venus game
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
		// === SAVE VENUS DATA FOR PERFORMANCE DASHBOARD ===
		const pm = ProgressManager.getInstance();
		pm.setResult('venus', {
			label: 'Venus Math Mission',
			score: summary.correctAnswers,
			total: summary.totalQuestions,
			accuracy: summary.correctAnswers / summary.totalQuestions,
			played: true,
			passed: summary.correctAnswers >= summary.minNumberOfQuestionsToWin,
		});
		this.view.hideTimer();
		this.removeInputBox();
		this.phase = 'mainSummary';
		this.view.setSubmitLabel(passed ? 'CHALLENGE' : 'RETRY'); // invite rapid fire if passed
		this.view.showMessage(
			passed
				? 'Ready for a 5-second speed round on Venus?'
				: 'Score under 80%. Tap retry to try again.',
			passed ? theme.get('success') : theme.get('warning')
		);
	}

	/**
	 * display the rapid-fire game introduction
	 */
	private startChallengeIntro(): void {
		this.phase = 'challengeIntro';
		this.view.showModal(
			'Rapid-fire finale: 5 seconds per question.\nStay sharp to reach Earth.\nPress Start to begin.'
		);
		this.view.setSubmitLabel('START');
		this.view.hideTimer();
	}

	/**
	 * start the rapid-fire game
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
	 * handle challenge completion: display summary screen, decide whether
	 * players can move on to Earth or retry the rapid-fire game
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
		this.view.setSubmitLabel(passed ? 'GO TO EARTH' : 'RETRY');
		this.view.setReturnButtonVisible(false);
		this.view.showMessage(
			passed
				? 'Challenge complete! Next stop: Earth.'
				: 'Missed the target. Retry the speed round?',
			passed ? theme.get('success') : theme.get('warning')
		);
	}
}
/* ---------------- End Rapid-fire Game Modified ---------------- */
