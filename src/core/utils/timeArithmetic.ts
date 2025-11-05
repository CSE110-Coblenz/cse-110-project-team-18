export interface TimeQuestion {
	question: string;
	startHour: number;
	startMinute: number;
	startPeriod: 'AM' | 'PM';
	correctHour: number;
	correctMinute: number;
	correctPeriod: 'AM' | 'PM';
	deltaMinutes: number;
}

/**
 * Generate a random time arithmetic question (with AM/PM)
 */
export function generateTimeQuestion(): TimeQuestion {
	// Start time
	const startHour = Math.floor(Math.random() * 12) || 12;
	const minuteOptions = [0, 15, 30, 45];
	const startMinute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
	const startPeriod: 'AM' | 'PM' = Math.random() < 0.5 ? 'AM' : 'PM';

	// Add or subtract time
	const add = Math.random() < 0.5;
	const deltaHours = Math.floor(Math.random() * 5) + (Math.random() < 0.5 ? 0.5 : 0);
	const deltaMinutes = Math.round(deltaHours * 60) * (add ? 1 : -1);

	// Convert start time to total minutes (24-hour clock)
	let totalMinutes =
		(startHour % 12) * 60 + startMinute + (startPeriod === 'PM' ? 12 * 60 : 0) + deltaMinutes;

	// Normalize within 24 hours
	totalMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);

	// Compute resulting time
	const correct24Hour = Math.floor(totalMinutes / 60);
	const correctMinute = totalMinutes % 60;
	const correctPeriod: 'AM' | 'PM' = correct24Hour >= 12 ? 'PM' : 'AM';
	const correctHour = correct24Hour % 12 === 0 ? 12 : correct24Hour % 12;

	// Question formatting
	const deltaLabel = Math.abs(deltaHours).toFixed(1);

	const startTimeStr = formatTime(startHour, startMinute, startPeriod);
	const question = add
		? `It is ${startTimeStr}. What time will it be in ${deltaLabel} hour${deltaLabel === '1.0' ? '' : 's'}?`
		: `It is ${startTimeStr}. What time was it ${deltaLabel} hour${deltaLabel === '1.0' ? '' : 's'} ago?`;

	return {
		question,
		startHour,
		startMinute,
		startPeriod,
		correctHour,
		correctMinute,
		correctPeriod,
		deltaMinutes,
	};
}

/**
 * Format time as "H:MM AM/PM"
 */
function formatTime(hour: number, minute: number, period: 'AM' | 'PM'): string {
	const h = hour === 0 ? 12 : hour;
	const m = minute.toString().padStart(2, '0');
	return `${h}:${m} ${period}`;
}
