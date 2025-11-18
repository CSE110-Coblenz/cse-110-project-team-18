export class EarthScreenModel {
	currentQuestion = 1;
	totalQuestions = 15;
	correctAnswers = 0;
	maxAttempts = 3;
	attempts = 0;

	correctHour = 0;
	correctMinute = 0;
	correctPeriod: 'AM' | 'PM' = 'AM';

	// new: Track all completed questions
	questionsHistory: any[] = [];
	currentIndex = -1; // index of the current question in history
}
