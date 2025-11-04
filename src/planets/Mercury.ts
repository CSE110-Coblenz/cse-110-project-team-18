import * as readline from "readline";

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

    // instances
    private questionsBank: Question[]; // load set of question from database
    private readonly maxNumberOfQuestions: number = 5; // max number of questions
    private questionCount: number; // the current question
    private correctAnswers: number; // the correct answers
    private answersBank: number[]; // set of answers created when questions are loaded

    /**
     * constructor initiates questionsBank, questionCount, and calculates the 
     * answers for all questions
    */
    constructor() {
        this.questionsBank = [
            {text: "1 + 1 = ", firstTerm: 1, secondTerm: 1, operation: "+"},
            {text: "1 - 2 = ", firstTerm: 1, secondTerm: 2, operation: "-"},
            {text: "1 * 3 = ", firstTerm: 1, secondTerm: 3, operation: "*"},
            {text: "1 / 4 = ", firstTerm: 1, secondTerm: 4, operation: "/"},
            {text: "1 + 5 = ", firstTerm: 1, secondTerm: 5, operation: "+"}
        ];
        this.questionCount = 0;
        this.correctAnswers = 0;
        this.answersBank = this.initAnswersBank();
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
            if (question.operation === "+") {
                var answer = question.firstTerm + question.secondTerm;
                answers.push(answer);
            } else if (question.operation === "-") {
                var answer = question.firstTerm - question.secondTerm;
                answers.push(answer);
            } else if (question.operation === "*") {
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
     * run() controls the game flow of the planet, 
     * awaits for inputs, 
     * display questions, results, summary,
     * updates progress,
     * runs minigame
    */
    public async run(): Promise<void> {
        while (this.questionCount < this.maxNumberOfQuestions) {
            this.displayQuestion();
            const answer = await this.handleInput();
            const correct = this.examineAnswer(answer);
            this.displayResult(correct);
            this.questionCount++;
        }
        // run rapid fire minigame at the end of the level
        this.displaySummary(this.correctAnswers);
    }

    /**
     * displayQuestion() displays the question window where player can 
     * see the question and type in their answer.
    */
    private displayQuestion(): void {
        console.log(`Question ${this.questionCount + 1}`);
        console.log(`${this.questionsBank[this.questionCount].text} ?`);
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
            rl.question("", (answer) => {
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
            return true;
        }
        return false;
    }

    /**
     * displayResult() displays whether player answers correct or not
     * 
     * @param correct the decision given by examineAnswer()
    */
    private displayResult(correct: boolean): void {
        if (correct) {
            console.log(`Correct!`);
            this.correctAnswers += 1;
        } else {
            console.log(`Incorrect!`);
        }
        console.log(`${this.questionsBank[this.questionCount].text} = ${this.answersBank[this.questionCount]}`);
        console.log();
    }

    /**
     * displaySummary() displays the overall performance: how many
     * correct answers and let player know whether they should retry
     * the planet to able to go to next planet or not.
     * 
     * @param correctAnswers the number of correct answers after 5 rounds
    */
    private displaySummary(correctAnswers: number): void {
        console.log("===== Summary =====");
        console.log(`Correct Answers: ${correctAnswers}/5`);
        if (correctAnswers < 4) {
            console.log("Please try again till you get 4/5.");
        } else {
            console.log("Ready for new planet!");
        }
    }
}

const mercury = new Mercury();
mercury.run();
