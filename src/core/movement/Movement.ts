import Konva from "konva";

/**
 * Base Movement class that handles basic movement mechanics
 * Can be extended for specific movement types (player, planets, etc.)
 */
export class Movement {
    protected sprite: Konva.Node;
    protected speed: number;
    protected position: { x: number; y: number };

    constructor(sprite: Konva.Node, speed: number = 5) {
        this.sprite = sprite;
        this.speed = speed;
        this.position = {
            x: sprite.x(),
            y: sprite.y()
        };
    }

    /**
     * Update position based on delta time
     * @param deltaTime Time elapsed since last update in milliseconds
     */
    update(deltaTime: number): void {
        // Base update method - to be overridden by specific movement types
        this.sprite.x(this.position.x);
        this.sprite.y(this.position.y);
    }

    /**
     * Set the movement speed
     * @param speed New speed value
     */
    setSpeed(speed: number): void {
        this.speed = speed;
    }

    /**
     * Get current position
     */
    getPosition(): { x: number; y: number } {
        return { ...this.position };
    }

    /**
     * Set position directly
     */
    setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.y = y;
        this.update(0);
    }
}
