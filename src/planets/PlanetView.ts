class PlanetView {

    private planet: string;

    constructor(planet: string) {
        this.planet = planet;
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