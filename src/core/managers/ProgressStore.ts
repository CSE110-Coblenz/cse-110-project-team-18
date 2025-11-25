export class ProgressStore {
	private static instance: ProgressStore;

	private accuracy: Record<string, number> = {};

	private constructor() {}

	static getInstance(): ProgressStore {
		if (!ProgressStore.instance) {
			ProgressStore.instance = new ProgressStore();
		}
		return ProgressStore.instance;
	}

	setAccuracy(topic: string, accuracy: number) {
		this.accuracy[topic] = accuracy;
	}

	getAccuracy(topic: string): number {
		return this.accuracy[topic] ?? 0;
	}

	getAll() {
		return { ...this.accuracy };
	}
}
