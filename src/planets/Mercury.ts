import * as readline from 'readline';
import { PlanetView } from './PlanetView';
import { randomInt } from './PlanetUtils';
import { randomChar } from './PlanetUtils';

type Question = {
	text: string;
	firstTerm: number;
	secondTerm: number;
	operation: string;
};

/**
 * class Mercury handles game basic arithmetic logic
 */
class Mercury implements Planet {
	// class instances
    private readonly planetId: string = 'mercury'; // planet identifier
	private questionsBank: Question[]; // load set of question from database
	private readonly maxNumberOfQuestions: number = 10; // max number of questions
    private minNumberOfQuestionsToWin: number; // min number of question to win
	private questionCount: number; // the current question
	private correctAnswers: number; // the correct answers
	private answersBank: number[]; // set of answers created when questions are loaded
    private planetView: PlanetView; // display questions, results, and summary windows

	/**
	 * constructor initiates questionsBank, questionCount, and calculates the
	 * answers for all questions
	 */
	constructor() {
		this.questionsBank = this.initQuestionsBank();
        this.minNumberOfQuestionsToWin = 0.8 * this.maxNumberOfQuestions;
		this.questionCount = 0;
		this.correctAnswers = 0;
		this.answersBank = this.initAnswersBank();
        this.planetView = new PlanetView(this.planetId);
	}

	/**
	 * initAnswersBank() goes over every question, calculates the answer and
	 * adds to the answersBank array
	 *
	 * @returns array of answers
	 */
	private initAnswersBank(): number[] {
		var answers: number[] = [];

		for (const question of this.questionsBank) {
			if (question.operation === '+') {
				var answer = question.firstTerm + question.secondTerm;
				answers.push(answer);
			} else if (question.operation === '-') {
				var answer = question.firstTerm - question.secondTerm;
				answers.push(answer);
			} else if (question.operation === '*') {
				var answer = question.firstTerm * question.secondTerm;
				answers.push(answer);
			} else {
				var answer = question.firstTerm / question.secondTerm;
				answers.push(answer);
			}
		}

		return answers;
	}

    /**
     * initQuestionsBank() generates random arithmetic equations for each play 
     * 
     * @returns an array of questions
    */
    private initQuestionsBank(): Question[] {
        var bank: Question[] = [];
        var count: number = 0;

        for (let i = 0; i < this.maxNumberOfQuestions; i++) {
            var question: Question;
            const op: string = randomChar("+-*/");

            if (count < 3) {
                question = this.initQuestion(randomInt(1,3), randomInt(1,3), op);
            } else if (count < 5) {
                question = this.initQuestion(randomInt(3,5), randomInt(3,5), op);
            } else if (count < 7) {
                question = this.initQuestion(randomInt(1,3), randomInt(1,3), op);
            } else {
                question = this.initQuestion(randomInt(1,3), randomInt(1,3), op);
            }

            bank.push(question);
        }

        return bank;
    }

    /**
     * initQuestion() creates a question
     * 
     * @param first the first term of the equation
     * @param second the second term of the equation
     * @param op the operation used in the equation
     * @returns a question label with equation's components
    */
    private initQuestion(first: number, second: number, op: string): Question {
        return {text: `${first} ${op} ${second} =`, firstTerm: first, secondTerm: second, operation: op};
    } 

	/**
	 * run() controls the game flow of the planet,
	 * awaits for inputs,
	 * display questions, results, summary,
	 * updates progress,
	 * runs minigame.
	 */
	public async run(): Promise<void> {
		while (this.questionCount < this.maxNumberOfQuestions) {
			this.planetView.displayQuestion(this.questionCount, this.questionsBank[this.questionCount].text);
			const answer = await this.handleInput();
			const isCorrect = this.examineAnswer(answer);
			this.planetView.displayResult(isCorrect, 
                this.questionsBank[this.questionCount].text, 
                this.answersBank[this.questionCount]);
			this.questionCount++;
		}

		/* run rapid fire minigame at the end of the level */
        
		this.planetView.displaySummary(this.correctAnswers, this.maxNumberOfQuestions, this.minNumberOfQuestionsToWin);
	}

	/**
	 * handleInput() retrieves answers from listener, validates the inputs,
	 * and returns the answers to examineAnswer(answer) to update the progress
	 *
	 * @returns the promise of input
	 */
	private handleInput(): Promise<number> {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		const promise: Promise<number> = new Promise((done) => {
			rl.question("Answer: ", (answer) => {
				rl.close();
				done(Number(answer));
			});
		});

		return promise;
	}

	/**
	 * examineAnswer() compares player's answer with question's answer
	 * and decides whether the answer is correct or not.
	 *
	 * @param answer player's answer
	 * @returns true if player's answer equals with our answer, otherwise, false
	 */
	private examineAnswer(answer: number): boolean {
		if (answer === this.answersBank[this.questionCount]) {
            this.correctAnswers++;
			return true;
		}
		return false;
	}

}

const mercury = new Mercury();
mercury.run();
