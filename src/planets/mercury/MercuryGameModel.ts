import { randomInt } from '../PlanetUtils';

/* Operations are used for the Mercury Game */
type Operation = '+' | '-' | '*' | '/';

/* Question stores the question's text, its answer, and operation. */
type Question = {
	text: string;
	answer: number;
	operation: Operation;
};

/**
 * MercuryGameModel class contains the arithmetic logic for the Mercury mission.
 */
export class MercuryGameModel {
	/* Mercury Game Model Fields */
	private questionsBank: Question[] = []; // Questions Bank storing questions
	private readonly maxNumberOfQuestions = 10; // Max number of questions
	private readonly minNumberOfQuestionsToWin: number; // Min number of questions
	private questionIndex = 0; // current question
	private correctAnswers = 0; // keep track of correct answers

	/**
	 * constructor setups fields when the game is created
	 */
	constructor() {
		this.minNumberOfQuestionsToWin = Math.ceil(this.maxNumberOfQuestions * 0.8);
		this.reset();
	}

	/**
	 * reset all fields
	 */
	public reset(): void {
		this.questionsBank = this.generateQuestions();
		this.questionIndex = 0;
		this.correctAnswers = 0;
	}

	/**
	 * get current question question
	 *
	 * @returns the current question or undefined if there's no question left
	 */
	public getCurrentQuestion(): Question | undefined {
		return this.questionsBank[this.questionIndex];
	}

	/**
	 * get the index of the current question
	 *
	 * @returns the current question's number
	 */
	public getCurrentQuestionIndex(): number {
		return this.questionIndex;
	}

	/**
	 * get the max total of questions
	 *
	 * @returns the max number of questions
	 */
	public getTotalQuestions(): number {
		return this.maxNumberOfQuestions;
	}

	/**
	 * check if the questions bank still has questions
	 *
	 * @returns true if the index of current question is smaller than the length
	 * of questions bank and false otherwise
	 */
	public hasMoreQuestions(): boolean {
		return this.questionIndex < this.questionsBank.length;
	}

	/**
	 * check the given answer
	 *
	 * @param answer a number
	 * @returns the pair of values: the correctness and current number
	 * of correct answers
	 */
	public submitAnswer(answer: number): { isCorrect: boolean; correctAnswer: number } {
		const currentQuestion = this.getCurrentQuestion();

		// the question is underfined, returns false and not increment
		// the number of correct answer
		if (currentQuestion === undefined) {
			return { isCorrect: false, correctAnswer: 0 };
		}

		// check if the given answer same with correct answer
		const isCorrect = answer === currentQuestion.answer ? true : false;

		// increment the number of correct answers if the given answer is correct
		if (isCorrect) {
			this.correctAnswers++;
		}
		// increment question index
		this.questionIndex++;

		return { isCorrect, correctAnswer: currentQuestion.answer };
	}

	/**
	 * get correct answers, total questions, and min number of questions to win
	 *
	 * @returns a list of values including the number of correct answers, total
	 * number of questions, and corrected questions needed to win
	 */
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

	/**
	 * generate list of random questions for question banks
	 *
	 * @returns an array of random math questions
	 */
	private generateQuestions(): Question[] {
		const questions: Question[] = [];

		for (let i = 0; i < this.maxNumberOfQuestions; i++) {
			const operation = this.pickOperation(i);
			questions.push(this.createQuestion(operation));
		}

		return questions;
	}

	/**
	 * randomly pick an operation based on current question's index
	 * + and - for question 1 - 3, +, -, *, and / for question 4 - 10
	 *
	 * @param index the index of current question
	 * @returns the operation
	 */
	private pickOperation(index: number): Operation {
		if (index < 3) {
			return Math.random() > 0.5 ? '+' : '-';
		}
		const operations: Operation[] = ['+', '-', '*', '/'];
		const choiceIndex = randomInt(0, operations.length - 1);
		return operations[choiceIndex];
	}

	/**
	 * create the question with first and second operands having
	 * the range from 1 to 12.
	 *
	 * @param operation used for the question
	 * @returns the question with text, answer, operation
	 */
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
