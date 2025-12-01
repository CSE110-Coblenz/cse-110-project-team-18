export type GameResult = {
	label: string;
	score: number;
	total: number;
	accuracy: number;
	played: boolean;
	passed: boolean;
};

export class ProgressManager {
	private static instance: ProgressManager;
	private data: Record<string, GameResult> = {};

	static getInstance(): ProgressManager {
		if (!ProgressManager.instance) {
			ProgressManager.instance = new ProgressManager();
		}
		return ProgressManager.instance;
	}

	setResult(label: string, result: GameResult) {
		this.data[label] = result;
	}

	getAll(): Record<string, GameResult> {
		return this.data;
	}
}
