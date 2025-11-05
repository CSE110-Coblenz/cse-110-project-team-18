/**
 * EarthScreenModel - Stores state for the Earth Time Game
 */
export class EarthScreenModel {
	// Current question index
	currentQuestion = 1;
	totalQuestions = 15;

	// Attempts tracking
	attempts = 0;
	maxAttempts = 3;

	// Scoring
	correctAnswers = 0;

	// Correct answer for the current question
	correctHour = 0;
	correctMinute = 0;
	correctPeriod: 'AM' | 'PM' = 'AM'; // ✅ added this line
}
