import { randomInt } from '../PlanetUtils';

type Operation = '+' | '-' | '*' | '/';

type Question = {
	text: string;
	answer: number;
	operation: Operation;
};

/**
 * MercuryGameModel contains the arithmetic logic for the Mercury mission.
 */
export class MercuryGameModel {
	private questionsBank: Question[] = [];
	private readonly maxNumberOfQuestions = 10;
	private readonly minNumberOfQuestionsToWin: number;
	private questionIndex = 0;
	private correctAnswers = 0;

	constructor() {
		this.minNumberOfQuestionsToWin = Math.ceil(this.maxNumberOfQuestions * 0.8);
		this.reset();
	}

	public reset(): void {
		this.questionsBank = this.generateQuestions();
		this.questionIndex = 0;
		this.correctAnswers = 0;
	}

	public getCurrentQuestion(): Question | undefined {
		return this.questionsBank[this.questionIndex];
	}

	public getCurrentQuestionIndex(): number {
		return this.questionIndex;
	}

	public getTotalQuestions(): number {
		return this.maxNumberOfQuestions;
	}

	public hasMoreQuestions(): boolean {
		return this.questionIndex < this.questionsBank.length;
	}

	public submitAnswer(answer: number): { isCorrect: boolean; correctAnswer: number } {
		const currentQuestion = this.getCurrentQuestion();
		if (!currentQuestion) {
			return { isCorrect: false, correctAnswer: 0 };
		}

		const isCorrect = answer === currentQuestion.answer;
		if (isCorrect) {
			this.correctAnswers++;
		}
		this.questionIndex++;

		return {
			isCorrect,
			correctAnswer: currentQuestion.answer,
		};
	}

	public getSummary(): {
		correctAnswers: number;
		totalQuestions: number;
		minNumberOfQuestionsToWin: number;
	} {
		return {
			correctAnswers: this.correctAnswers,
			totalQuestions: this.maxNumberOfQuestions,
			minNumberOfQuestionsToWin: this.minNumberOfQuestionsToWin,
		};
	}

	private generateQuestions(): Question[] {
		const questions: Question[] = [];
		for (let i = 0; i < this.maxNumberOfQuestions; i++) {
			const operation = this.pickOperation(i);
			questions.push(this.createQuestion(operation));
		}
		return questions;
	}

	private pickOperation(index: number): Operation {
		if (index < 3) {
			return Math.random() > 0.5 ? '+' : '-';
		}
		const operations: Operation[] = ['+', '-', '*', '/'];
		const choiceIndex = randomInt(0, operations.length - 1);
		return operations[choiceIndex];
	}

	private createQuestion(operation: Operation): Question {
		let first = randomInt(1, 12);
		let second = randomInt(1, 12);
		let text = `${first} ${operation} ${second}`;
		let answer: number;

		switch (operation) {
			case '+':
				answer = first + second;
				break;
			case '-':
				if (second > first) {
					[first, second] = [second, first];
				}
				text = `${first} - ${second}`;
				answer = first - second;
				break;
			case '*':
				answer = first * second;
				text = `${first} x ${second}`;
				break;
			case '/': {
				second = Math.max(1, second);
				const quotient = randomInt(1, 12);
				first = second * quotient;
				text = `${first} / ${second}`;
				answer = quotient;
				break;
			}
		}

		return { text, answer, operation };
	}
}
