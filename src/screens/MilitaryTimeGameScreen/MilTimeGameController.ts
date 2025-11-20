/* eslint-disable @typescript-eslint/no-unused-vars */
import { ScreenController } from '../../types';
import type { ScreenSwitcher } from '../../types';
import { MilitaryTimeGameModel } from './MilTimeGameModel';
import { MilitaryTimeGameView } from './MilTimeGameView';

export class MilitaryTimeGameController extends ScreenController {
	private model: MilitaryTimeGameModel;
	private view: MilitaryTimeGameView;
	private screenSwitcher: ScreenSwitcher;

	private answered = false;

	constructor(screenSwitcher: ScreenSwitcher) {
		super();
		this.screenSwitcher = screenSwitcher;

		this.model = new MilitaryTimeGameModel();
		this.view = new MilitaryTimeGameView(
			(choice) => this.handleChoice(choice),
			() => this.screenSwitcher.switchToScreen({ type: 'menu' })
		);
	}

	getView() {
		return this.view;
	}

	override show() {
		super.show();
		this.model.reset();
		this.answered = false;
		this.view.show();
		this.view.renderSlide(
			this.model.getCurrentSlide(),
			this.model.currentIndex,
			this.model.questionsTotal
		);
	}

	override hide() {
		super.hide();
		this.view.hide();
	}

	private handleChoice(choice: string) {
		// START QUIZ button
		if (choice === 'START') {
			this.model.nextSlide();
			this.answered = false;
			this.view.renderSlide(
				this.model.getCurrentSlide(),
				this.model.currentIndex,
				this.model.questionsTotal
			);

			return;
		}
		if (this.answered) return; // only one attempt allowed
		this.answered = true;

		const slide = this.model.getCurrentSlide();
		if (slide.type !== 'question') return;

		// Lock buttons
		this.view.disableAnswerButtons();

		if (choice === slide.correct) {
			this.model.correctCount++;
			this.view.showFeedback(`Correct!\n${slide.explanation}`, 'lightgreen');

			// Move on after 2 seconds
			setTimeout(() => this.goNext(), 2000);
		} else {
			this.view.showFeedback(`Not quite!\n${slide.explanation}`, 'red');

			// Move on after 5 seconds
			setTimeout(() => this.goNext(), 3000);
		}
	}

	private goNext() {
		// const slide = this.model.getCurrentSlide();

		// Final question? → Show result
		if (this.model.currentIndex === this.model.questionsTotal) {
			const passed = this.model.correctCount >= this.model.passingScore;

			this.view.renderResult(
				passed,
				() => this.restartQuiz(),
				() => this.screenSwitcher.switchToScreen({ type: 'earth' })
			);
			return;
		}

		// Normal progression
		this.model.nextSlide();
		this.answered = false;
		this.view.renderSlide(
			this.model.getCurrentSlide(),
			this.model.currentIndex,
			this.model.questionsTotal
		);
	}

	private restartQuiz() {
		this.model = new MilitaryTimeGameModel();
		this.answered = false;
		this.view.renderSlide(
			this.model.getCurrentSlide(),
			this.model.currentIndex,
			this.model.questionsTotal
		);
	}
}
