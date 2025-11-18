export class KnowledgeScreenModel {
	private slides = [
		{
			title: 'Military Time Training',
			text: `We need your help to keep navigating our spaceship through the solar system!

        To stay on course, you'll need to calculate time in military format (24-hour time),
        just like real astronauts and engineers.

        Military time removes AM/PM confusion and runs from 00:00 to 23:59.
        After noon, we keep counting upward!

        Examples:
        1:00 PM → 13:00
        6:00 PM → 18:00
        11:45 PM → 23:45
        Midnight → 00:00`,
		},
	];

	private index = 0;

	getCurrentSlide() {
		return this.slides[this.index];
	}

	nextSlide() {
		if (this.index < this.slides.length - 1) {
			this.index++;
			return true;
		}
		return false;
	}

	isLastSlide() {
		return this.index === this.slides.length - 1;
	}
}
