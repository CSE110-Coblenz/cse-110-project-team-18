import { randomInt } from '../PlanetUtils';

type Operation = '+' | '-' | '*' | '/';

type Question = {
	text: string;
	answer: number;
	operation: Operation;
};

/**
 * VenusGameModel contains the arithmetic logic for the Venus mission.
 */
export class VenusGameModel {
	private questionsBank: Question[] = [];
	// add constant for the max number of questions
	private readonly defaultMaxNumberOfQuestions = 10;
	private maxNumberOfQuestions: number;
	private minNumberOfQuestionsToWin: number;
	private questionIndex = 0;
	private correctAnswers = 0;

	constructor() {
		// initialize the fields
		this.maxNumberOfQuestions = this.defaultMaxNumberOfQuestions;
		this.minNumberOfQuestionsToWin = Math.ceil(this.maxNumberOfQuestions * 0.8);
		this.reset(this.defaultMaxNumberOfQuestions);
	}

	public reset(questionCount: number = this.defaultMaxNumberOfQuestions): void {
		// allow to choose the max number of questions; default is 10
		this.maxNumberOfQuestions = questionCount;
		this.minNumberOfQuestionsToWin = Math.ceil(this.maxNumberOfQuestions * 0.8);
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

	/**
	 * return the number of correct answers so far
	 *
	 * @returns the number of correct answers
	 */
	public getCorrectAnswers(): number {
		return this.correctAnswers;
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
		// Default initializers
		let first = 0;
		let second = 0;
		let text = '';
		let answer = 0;

		switch (operation) {
			case '+':
				first = randomInt(10, 99);
				second = randomInt(10, 99);
				answer = first + second;
				text = `${first} + ${second}`;
				break;
			case '-':
				first = randomInt(10, 99);
				second = randomInt(10, 99);

				if (second > first) {
					[first, second] = [second, first];
				}
				answer = first - second;
				text = `${first} - ${second}`;
				break;
			case '*':
				first = randomInt(5, 20);
				second = randomInt(5, 20);
				answer = first * second;
				text = `${first} x ${second}`;
				break;
			case '/': {
				second = randomInt(5, 15);
				const quotient = randomInt(5, 15);

				first = second * quotient;
				answer = quotient;
				text = `${first} / ${second}`;
				break;
			}
		}

		return { text, answer, operation };
	}
}
