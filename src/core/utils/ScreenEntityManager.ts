/**
 * ScreenEntityManagerOptions - Options for the screen entity manager
 * @param create - The function to create the entity
 * @param dispose - The function to dispose of the entity
 */
export interface ScreenEntityManagerOptions<T> {
	create: () => T;
	dispose: (instance: T) => void;
}

/**
 * ScreenEntityManager - Manages the lifecycle of a screen entity
 * @param T - The type of the entity
 * @param options - The options for the screen entity manager
 */
export class ScreenEntityManager<T> {
	private instance: T | null = null;

	constructor(private readonly options: ScreenEntityManagerOptions<T>) {}

	/**
	 * Ensure the entity is created
	 * @returns The entity
	 */
	ensure(): T {
		if (!this.instance) {
			this.instance = this.options.create();
		}
		return this.instance;
	}

	/**
	 * Get the entity
	 * @returns The entity
	 */
	get(): T | null {
		return this.instance;
	}

	/**
	 * Dispose of the entity
	 */
	dispose(): void {
		if (!this.instance) return;
		this.options.dispose(this.instance);
		this.instance = null;
	}
}
