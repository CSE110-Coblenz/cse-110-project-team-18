export interface TimeQuestion {
	question: string;
	startHour: number;
	startMinute: number;
	correctHour: number;
	correctMinute: number;
	deltaMinutes: number;
}

/**
 * Generate a random time arithmetic question (24-hour format)
 */
export function generateTimeQuestion(): TimeQuestion {
	// Start time (0–23 hours)
	const startHour = Math.floor(Math.random() * 24);
	const minuteOptions = [0, 15, 30, 45];
	const startMinute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];

	// Randomly choose addition or subtraction
	const add = Math.random() < 0.5;

	// Possible time differences (in hours, including fractions)
	const deltaHourOptions = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
	const deltaHours = deltaHourOptions[Math.floor(Math.random() * deltaHourOptions.length)];
	const deltaMinutes = Math.round(deltaHours * 60) * (add ? 1 : -1);

	// Apply change and wrap around 24 hours
	let totalMinutes = startHour * 60 + startMinute + deltaMinutes;
	totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);

	const correctHour = Math.floor(totalMinutes / 60);
	const correctMinute = totalMinutes % 60;

	// Natural phrasing for the question
	const minutes = Math.abs(deltaMinutes);
	let deltaLabel: string;
	if (minutes === 15) deltaLabel = '15 minutes';
	else if (minutes === 30) deltaLabel = '30 minutes';
	else if (minutes === 45) deltaLabel = '45 minutes';
	else deltaLabel = `${Math.abs(deltaHours)} hour${Math.abs(deltaHours) === 1 ? '' : 's'}`;

	const startTimeStr = formatTime(startHour, startMinute);
	const question = add
		? `It is ${startTimeStr}. What time will it be in ${deltaLabel}?`
		: `It is ${startTimeStr}. What time was it ${deltaLabel} ago?`;

	return {
		question,
		startHour,
		startMinute,
		correctHour,
		correctMinute,
		deltaMinutes,
	};
}

/**
 * Format time as HH:MM (24-hour)
 */
function formatTime(hour: number, minute: number): string {
	const h = hour.toString().padStart(2, '0');
	const m = minute.toString().padStart(2, '0');
	return `${h}:${m}`;
}
