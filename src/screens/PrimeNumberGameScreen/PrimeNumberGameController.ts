import { PrimeNumberGameModel } from './PrimeNumberGameModel.ts';
import { PrimeNumberGameView } from './PrimeNumberGameView.ts';
import type { ScreenSwitcher, ScreenController } from '../../types.ts';
import { ProgressManager } from '../../core/managers/ProgressManager';

/** API base for progress route (same as Mercury/Venus/Earth) */
const API_BASE = 'http://localhost:3000/api';

/**
 * Connects the Model and View. Handles user input.
 */
export class PrimeNumberGameController implements ScreenController {
	private model: PrimeNumberGameModel;
	private view: PrimeNumberGameView;
	private screenSwitcher: ScreenSwitcher;
	private numberOfQuestions: number = 10;

	constructor(switcher: ScreenSwitcher) {
		this.screenSwitcher = switcher;

		// Create its own model and view
		this.model = new PrimeNumberGameModel();
		this.view = new PrimeNumberGameView();

		// Bind view events to controller methods
		this.view.bindSubmitAnswer(this.handleSubmitAnswer.bind(this));
	}

	/**
	 * Returns the main Konva.Group for this screen.
	 */
	public getView(): PrimeNumberGameView {
		return this.view;
	}

	/**
	 * Makes this screen's Konva.Group visible.
	 */
	public show(): void {
		this.view.show();
	}

	/**
	 * Makes this screen's Konva.Group invisible.
	 */
	public hide(): void {
		this.view.hide();
	}

	/**
	 * Main update loop, called by main.ts
	 */
	public update(_dt: number): void {}

	/**
	 * Initializes and starts a new game session.
	 */
	public async startGame(): Promise<void> {
		await this.model.start(this.numberOfQuestions);
		this.view.updateScore(0);

		this.showNextQuestion();
	}

	/** Helper to save Mars score (planet_id = 4) so Asteroid can unlock */
	private async saveMarsScore(finalScore: number): Promise<void> {
		const userId = (window as any).__CURRENT_USER_ID__ as number | undefined;
		if (!userId) {
			console.warn('[Mars] No current user ID; skipping DB save.');
			return;
		}

		try {
			const res = await fetch(`${API_BASE}/progress/update-score`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId,
					planetId: 4, // Mars = planet_id 4
					score: finalScore, // must be > 0 to unlock Asteroid (5)
				}),
			});

			if (!res.ok) {
				console.error('[Mars] Failed to save score:', res.status, await res.text());
			} else {
				console.log('[Mars] Score saved successfully for user', userId);
			}
		} catch (err) {
			console.error('[Mars] Error saving score:', err);
		}
	}

	private handleSubmitAnswer(userInput: string): void {
		const result = this.model.submitAnswer(userInput);

		this.view.updateScore(result.newScore);
		this.view.displayFeedback(result.isCorrect);

		setTimeout(() => {
			if (result.isGameOver) {
				const { score, maxScore } = this.model.getFinalScore();
				const accuracy = score / maxScore;
				const passed = accuracy >= 0.8;

				// Save for performance dashboard
				ProgressManager.getInstance().setResult('mars_prime', {
					label: 'Prime Number Game',
					score,
					total: maxScore,
					accuracy,
					played: true,
					passed,
				});

				/** If passed, persist Mars score so Asteroid Field (5) can unlock */
				if (passed && score > 0) {
					void this.saveMarsScore(score);
				}

				// Display summary first
				const summary = this.model.getSummary();
				this.view.displaySummary(
					summary.correctAnswers,
					summary.totalQuestions,
					summary.minNumberOfQuestionsToWin
				);

				// Show game over screen
				if (passed) {
					this.view.showGameOverScreen(null, () => {
						this.screenSwitcher.switchToScreen({ type: 'asteroid field game' });
					});
				} else {
					this.view.showGameOverScreen(() => {
						this.resetAndRetry();
					}, null);
				}
			} else {
				this.showNextQuestion();
			}
		}, 900);
	}

	private resetAndRetry(): void {
		// Reset the UI
		this.view.resetUI();
		// Reset the model and start a new game
		void this.startGame();
	}

	private showNextQuestion(): void {
		const question = this.model.getCurrentQuestion();
		if (question) {
			this.view.updateQuestion(
				question.text,
				this.model.currentQuestionIndex,
				this.model.totalQuestions
			);
		}
	}
}
