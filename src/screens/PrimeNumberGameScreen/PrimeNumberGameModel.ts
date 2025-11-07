/**
 * Manages the game state and logic for the Prime Number Game.
 */
export class PrimeNumberGameModel {
	private questionProvider: MarsQuestionGenerator;
	private answerChecker: IsPrimeAnswerChecker;

	public questions: MarsQuestion[] = [];
	public score: number = 0;
	public currentQuestionIndex: number = 0;
	public totalQuestions: number = 10;

	/**
	 * The constructor for the PrimeNumberGameModel
	 */
	constructor() {
		this.questionProvider = new MarsQuestionGenerator();
		this.answerChecker = new IsPrimeAnswerChecker();
	}

	public async start(numberOfQuestions: number): Promise<void> {
		this.totalQuestions = numberOfQuestions;
		this.score = 0;
		this.currentQuestionIndex = 0;
		this.questions = await this.questionProvider.getQuestions(numberOfQuestions);
	}

	public getCurrentQuestion(): MarsQuestion | null {
		if (this.currentQuestionIndex >= this.questions.length) {
			return null;
		}
		return this.questions[this.currentQuestionIndex];
	}

	public submitAnswer(userInput: string): {
		isCorrect: boolean;
		correctAnswerText: string;
		newScore: number;
		isGameOver: boolean;
	} {
		const question = this.getCurrentQuestion();
		if (!question)
			return { isCorrect: false, correctAnswerText: 'N/A', newScore: this.score, isGameOver: true };

		const isCorrect = this.answerChecker.check(userInput, question.answer);
		if (isCorrect) {
			this.score += question.scoreWeight;
		}

		this.currentQuestionIndex++;

		const isGameOver = this.currentQuestionIndex >= this.questions.length;

		return {
			isCorrect: isCorrect,
			correctAnswerText: this.answerChecker.getCorrectAnswerText(question.answer),
			newScore: this.score,
			isGameOver: isGameOver,
		};
	}

	public getFinalScore(): { score: number; maxScore: number } {
		const maxScore = this.questions.reduce((sum, q) => sum + q.scoreWeight, 0);
		return {
			score: this.score,
			maxScore: maxScore,
		};
	}
}

/**
 * Represents a question.
 */
class MarsQuestion {
	public text: string;
	public numberToTest: number;
	public answer: boolean;
	public scoreWeight: number;

	constructor(text: string, numberToTest: number, answer: boolean, scoreWeight = 10) {
		this.text = text;
		this.numberToTest = numberToTest;
		this.answer = answer;
		this.scoreWeight = scoreWeight;
	}
}

/**
 * Class for prime calculations.
 */
class NumberTheory {
	public static isPrime(n: number): boolean {
		if (n <= 1) return false;
		if (n <= 3) return true;
		if (n % 2 === 0 || n % 3 === 0) return false;
		for (let i = 5; i * i <= n; i = i + 6) {
			if (n % i === 0 || n % (i + 2) === 0) {
				return false;
			}
		}
		return true;
	}
}

/**
 * Generates "isPrime" questions.
 */
class MarsQuestionGenerator {
	public getQuestions(maxNumberOfQuestions: number): Promise<MarsQuestion[]> {
		const bank: MarsQuestion[] = [];
		for (let i = 0; i < maxNumberOfQuestions; i++) {
			const numToTest = this.getRandomInt(1, 55);
			const answer = NumberTheory.isPrime(numToTest);
			bank.push(new MarsQuestion(`Is ${numToTest} a prime number?`, numToTest, answer, 10));
		}
		return Promise.resolve(bank);
	}

	private getRandomInt(min: number, max: number): number {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}

/**
 * Class to check the "isPrime" answers.
 */
class IsPrimeAnswerChecker {
	public check(userInput: string, correctAnswer: boolean): boolean {
		const userAnswer = userInput.trim().toLowerCase() === 'yes';
		return userAnswer === correctAnswer;
	}

	public getCorrectAnswerText(correctAnswer: boolean): string {
		return correctAnswer ? 'yes' : 'no';
	}
}
