/**
 * EarthScreenModel - Stores game state for the Earth screen
 */
export class EarthScreenModel {
	question: string = '';
	correctAnswers: number = 0;
	correctHour: number = 0;
	correctMinute: number = 0;

	attempts: number = 0;
	maxAttempts: number = 3;

	// quiz progression
	currentQuestion: number = 1;
	totalQuestions: number = 15;
}
