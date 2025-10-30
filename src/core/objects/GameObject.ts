import Konva from "konva";

export type Vec2 = { x: number; y: number };

/**
 * Base GameObject
 * Lightweight container for entity state. Rendering is optional via a Konva node.
 */
export abstract class GameObject {
    id: string;
    model: Vec2;
    visible: boolean;
    protected node: Konva.Node | null = null;

    constructor(id: string, x = 0, y = 0) {
        this.id = id;
        this.model = { x, y };
        this.visible = true;
    }

    /** Called each frame with delta time in ms */
    update(_deltaTimeMs: number): void {
        // default no-op
    }

    attachNode(node: Konva.Node): void {
        this.node = node;
    }

    getNode(): Konva.Node | null {
        return this.node;
    }

    dispose(): void {
        if (this.node) {
            this.node.destroy();
            this.node = null;
        }
    }

    // collision hook
    onCollision?(other: GameObject): void;
}
