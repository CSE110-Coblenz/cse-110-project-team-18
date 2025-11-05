export interface TimeQuestion {
	question: string;
	startHour: number;
	startMinute: number;
	deltaMinutes: number;
	correctHour: number;
	correctMinute: number;
}

/**
 * Generate a random time arithmetic question
 * - Excludes 0 hours
 * - Uses only 15, 30, or 45 minute increments
 * - Formats hours/minutes naturally
 */
export function generateTimeQuestion(): TimeQuestion {
	// Random start time
	const startHour = Math.floor(Math.random() * 12);
	const startMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];

	// Randomly decide to add or subtract time
	const add = Math.random() < 0.5;

	// Allowed time changes (in minutes)
	const validIncrements = [
		15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240,
	];
	const deltaMinutesRaw = validIncrements[Math.floor(Math.random() * validIncrements.length)];
	const deltaMinutes = add ? deltaMinutesRaw : -deltaMinutesRaw;

	// Compute resulting time (wraps around 12 hours)
	let totalMinutes = startHour * 60 + startMinute + deltaMinutes;
	totalMinutes = ((totalMinutes % (12 * 60)) + 12 * 60) % (12 * 60);
	const correctHour = Math.floor(totalMinutes / 60);
	const correctMinute = totalMinutes % 60;

	// Generate readable question
	const absMinutes = Math.abs(deltaMinutesRaw);
	let question = '';

	if (absMinutes < 60) {
		// Less than 1 hour → say minutes
		const minutesText = `${absMinutes} minute${absMinutes === 15 ? 's' : ''}`;
		question = add
			? `It is ${formatTime(startHour, startMinute)}. What time will it be in ${minutesText}?`
			: `It is ${formatTime(startHour, startMinute)}. What time was it ${minutesText} ago?`;
	} else {
		// 1 hour or more → say hours + minutes
		const hours = Math.floor(absMinutes / 60);
		const mins = absMinutes % 60;
		let timePhrase = '';

		if (mins === 0) {
			timePhrase = `${hours} hour${hours > 1 ? 's' : ''}`;
		} else {
			timePhrase = `${hours} hour${hours > 1 ? 's' : ''} and ${mins} minutes`;
		}

		question = add
			? `It is ${formatTime(startHour, startMinute)}. What time will it be in ${timePhrase}?`
			: `It is ${formatTime(startHour, startMinute)}. What time was it ${timePhrase} ago?`;
	}

	return { question, startHour, startMinute, deltaMinutes, correctHour, correctMinute };
}

function formatTime(hour: number, minute: number): string {
	const h = hour === 0 ? 12 : hour;
	const m = minute.toString().padStart(2, '0');
	return `${h}:${m}`;
}
