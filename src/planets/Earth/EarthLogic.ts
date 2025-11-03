// earth logic for time arithmetic questions

export interface TimeQuestion {
	question: string;
	options: string[];
	correctAnswer: string;
}

/**
 * Generates a random time arithmetic question (addition or subtraction)
 * and four multiple-choice answers.
 */
export function generateTimeQuestion(): TimeQuestion {
	const hour1 = Math.floor(Math.random() * 12);
	const min1 = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
	const hour2 = Math.floor(Math.random() * 3);
	const min2 = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
	const operation = Math.random() < 0.5 ? '+' : '-';

	let correctHour = hour1;
	let correctMin = min1;

	if (operation === '+') {
		correctHour += hour2 + Math.floor((min1 + min2) / 60);
		correctMin = (min1 + min2) % 60;
	} else {
		let total1 = hour1 * 60 + min1;
		let total2 = hour2 * 60 + min2;
		let result = total1 - total2;
		if (result < 0) result += 12 * 60; // wrap around within 12-hour format
		correctHour = Math.floor(result / 60);
		correctMin = result % 60;
	}

	const correctAnswer = `${correctHour}:${String(correctMin).padStart(2, '0')}`;

	const options: string[] = [correctAnswer];
	while (options.length < 4) {
		const randomHour = (correctHour + Math.floor(Math.random() * 3) - 1 + 12) % 12;
		const randomMin = (correctMin + [0, 15, 30, 45][Math.floor(Math.random() * 4)]) % 60;
		const option = `${randomHour}:${String(randomMin).padStart(2, '0')}`;
		if (!options.includes(option)) options.push(option);
	}

	return {
		question: `${hour1}:${String(min1).padStart(2, '0')} ${operation} ${hour2}:${String(min2).padStart(2, '0')} = ?`,
		options: options.sort(() => Math.random() - 0.5),
		correctAnswer,
	};
}
