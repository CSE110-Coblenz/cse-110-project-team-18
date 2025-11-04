/**
 * class PlanetView is responsible to pull off window views in each planet
 * using idetifier planet to retrieve correct views from database
*/
export class PlanetView {

    // class isntances
	private planet: string; // indicates what planet's in action

	constructor(planet: string) {
		this.planet = planet;
	}

	/**
	 * displayQuestion() displays the question window where player can
	 * see the question and type in their answer.
     * 
     * @param questionCount the current question no.
     * @param questionText the current question storing in string
	 */
	public displayQuestion(questionCount: number, questionText: string): void {
		console.log(`Question ${questionCount + 1}`);
		console.log(`${questionText} ?`);
	}

	/**
	 * displayResult() displays whether player answers correct or not
	 *
	 * @param isCorrect the decision given by examineAnswer()
     * @param questionText the current question
     * @param answerText the answer corresponds to the question
	 */
	public displayResult(isCorrect: boolean, questionText: string, answerText: number): void {
		if (isCorrect) {
			console.log(`Correct!`);
		} else {
			console.log(`Incorrect!`);
		}
		console.log(`${questionText} ${answerText}`);
		console.log();
	}

	/**
	 * displaySummary() displays the overall performance: how many
	 * correct answers and let player know whether they should retry
	 * the planet to able to go to next planet or not.
	 *
	 * @param correctAnswers the number of correct answers after 5 rounds
	 */
	public displaySummary(correctAnswers: number, maxNumberOfQuestions: number, minNumberOfQuestionsToWin: number): void {
		console.log('===== Summary =====');
		console.log(`Correct Answers: ${correctAnswers}/${maxNumberOfQuestions}`);
		if (correctAnswers < minNumberOfQuestionsToWin) {
			console.log(`Please try again till you get ${minNumberOfQuestionsToWin}/${maxNumberOfQuestions}`);
		} else {
			console.log('Ready for new planet!');
		}
	}
}
