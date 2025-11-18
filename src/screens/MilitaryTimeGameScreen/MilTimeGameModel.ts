// -----------------------------------------
// TYPES
// -----------------------------------------
export type MilitarySlide =
	| { type: 'info'; title: string; text: string }
	| { type: 'question'; question: string; choices: string[]; correct: string; explanation: string }
	| { type: 'result'; passed: boolean };

// -----------------------------------------
// MODEL CLASS
// -----------------------------------------
export class MilitaryTimeGameModel {
	slides: MilitarySlide[] = [];
	currentIndex = 0;
	correctCount = 0;
	questionsTotal = 10;
	passingScore = 7;

	constructor() {
		this.slides = this.buildSlides();
	}

	// Build slides
	private buildSlides(): MilitarySlide[] {
		const list: MilitarySlide[] = [];

		// Info slide
		list.push({
			type: 'info',
			title: "Let's Practice Military Time!",
			text:
				"You'll answer 10 questions.\n" +
				'You must get at least 7 correct to move to the Earth Game.\n\n' +
				'Military time uses hours 00–23.\n' +
				'Example: 1 PM → 13:00',
		});

		// Build questions
		for (let i = 0; i < this.questionsTotal; i++) {
			list.push(this.generateQuestion());
		}

		return list;
	}

	private generateQuestion(): MilitarySlide {
		const h = Math.floor(Math.random() * 24);
		const m = Math.floor(Math.random() * 60);

		const correct = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
		const normal = this.to12Hour(h, m);

		// choices
		const choices = new Set<string>();
		choices.add(correct);

		while (choices.size < 4) {
			const hh = Math.floor(Math.random() * 24);
			const mm = Math.floor(Math.random() * 60);
			choices.add(`${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`);
		}

		return {
			type: 'question',
			question: `Convert to military time: ${normal}`,
			choices: Array.from(choices).sort(),
			correct,
			explanation: `${normal} becomes ${correct} in military time.`,
		};
	}

	private to12Hour(h: number, m: number): string {
		const suffix = h >= 12 ? 'PM' : 'AM';
		let hour = h % 12;
		if (hour === 0) hour = 12;
		return `${hour}:${m.toString().padStart(2, '0')} ${suffix}`;
	}

	getCurrentSlide(): MilitarySlide {
		return this.slides[this.currentIndex];
	}

	nextSlide() {
		if (this.currentIndex < this.slides.length - 1) {
			this.currentIndex++;
		}
	}

	prevSlide() {
		if (this.currentIndex > 0) {
			this.currentIndex--;
		}
	}

	isLastQuestion(): boolean {
		return this.currentIndex === this.questionsTotal;
	}

	pushResultSlide(passed: boolean) {
		this.slides.push({ type: 'result', passed });
	}
	reset() {
		this.currentIndex = 0;
		this.correctCount = 0;
	}
}
