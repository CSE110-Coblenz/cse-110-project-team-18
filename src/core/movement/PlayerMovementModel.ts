/**
 * PlayerMovementModel - model-driven player movement
 * Updates a simple player model {x,y} based on keyboard input.
 */
export class PlayerMovementModel {
    private model: { x: number; y: number };
    private speed: number; // pixels per second
    private keys: Set<string>;
    private enabled: boolean;
    private boundKeyDown: (e: KeyboardEvent) => void;
    private boundKeyUp: (e: KeyboardEvent) => void;

    constructor(model: { x: number; y: number }, speed: number = 150) {
        this.model = model;
        this.speed = speed;
        this.keys = new Set();
        this.enabled = true;
        this.boundKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);
        this.boundKeyUp = (e: KeyboardEvent) => this.handleKeyUp(e);
        this.setupKeyboardControls();
    }

    private setupKeyboardControls(): void {
        window.addEventListener('keydown', this.boundKeyDown);
        window.addEventListener('keyup', this.boundKeyUp);
    }

    private handleKeyDown(e: KeyboardEvent): void {
        this.keys.add(e.key.toLowerCase());
    }

    private handleKeyUp(e: KeyboardEvent): void {
        this.keys.delete(e.key.toLowerCase());
    }

    update(deltaTimeMs: number): void {
        if (!this.enabled) return;
        const dt = deltaTimeMs / 1000; // convert to seconds

        let vx = 0;
        let vy = 0;

        if (this.keys.has('w') || this.keys.has('arrowup')) vy = -1;
        if (this.keys.has('s') || this.keys.has('arrowdown')) vy = 1;
        if (this.keys.has('a') || this.keys.has('arrowleft')) vx = -1;
        if (this.keys.has('d') || this.keys.has('arrowright')) vx = 1;

        // normalize diagonal
        if (vx !== 0 && vy !== 0) {
            const n = 1 / Math.sqrt(2);
            vx *= n;
            vy *= n;
        }

        this.model.x += vx * this.speed * dt;
        this.model.y += vy * this.speed * dt;
    }

    getModel() {
        return this.model;
    }

    setEnabled(v: boolean) {
        this.enabled = v;
    }

    dispose(): void {
        window.removeEventListener('keydown', this.boundKeyDown);
        window.removeEventListener('keyup', this.boundKeyUp);
    }
}
