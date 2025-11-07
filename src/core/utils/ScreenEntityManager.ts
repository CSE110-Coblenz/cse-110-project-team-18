export interface ScreenEntityManagerOptions<T> {
	create: () => T;
	dispose: (instance: T) => void;
}

export class ScreenEntityManager<T> {
	private instance: T | null = null;

	constructor(private readonly options: ScreenEntityManagerOptions<T>) {}

	ensure(): T {
		if (!this.instance) {
			this.instance = this.options.create();
		}
		return this.instance;
	}

	get(): T | null {
		return this.instance;
	}

	dispose(): void {
		if (!this.instance) return;
		this.options.dispose(this.instance);
		this.instance = null;
	}
}
