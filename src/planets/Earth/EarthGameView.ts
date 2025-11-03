import { generateTimeQuestion, TimeQuestion } from './EarthLogic';

export class EarthGameView {
	private currentQuestion: TimeQuestion | null = null;
	private score = 0;

	constructor() {
		this.init();
	}

	private init(): void {
		const questionElem = document.getElementById('question');
		const optionsElem = document.getElementById('options');
		const resultElem = document.getElementById('result');

		if (!questionElem || !optionsElem || !resultElem) {
			console.error('EarthGameView: Missing HTML elements.');
			return;
		}

		const renderQuestion = (): void => {
			this.currentQuestion = generateTimeQuestion();
			questionElem.textContent = this.currentQuestion.question;
			optionsElem.innerHTML = '';

			this.currentQuestion.options.forEach((opt: string) => {
				const btn = document.createElement('button');
				btn.textContent = opt;
				btn.className = 'm-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg';
				btn.onclick = (): void => this.checkAnswer(opt, resultElem, renderQuestion);
				optionsElem.appendChild(btn);
			});
		};

		renderQuestion();
	}

	private checkAnswer(selected: string, resultElem: HTMLElement, renderNext: () => void): void {
		if (!this.currentQuestion) return;

		if (selected === this.currentQuestion.correctAnswer) {
			resultElem.textContent = '✅ Correct!';
			this.score += 1;
		} else {
			resultElem.textContent = `❌ Wrong! Correct: ${this.currentQuestion.correctAnswer}`;
			// maybe later implement tracking of missed questions here
			// missedQuestions.push({ question: this.currentQuestion, selected });
		}

		setTimeout((): void => {
			resultElem.textContent = '';
			renderNext();
		}, 1500);
	}
}
