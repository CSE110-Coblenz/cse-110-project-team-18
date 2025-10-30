import Konva from "konva";
import { PlayerMovementModel } from "./PlayerMovementModel";

export interface PlayerManagerOptions {
    group: Konva.Group;
    imageUrl: string;
    x?: number;
    y?: number;
    scale?: number; // uniform scale
    speed?: number; // pixels per second
    model?: { x: number; y: number };
}

/**
 * PlayerManager
 * Generic manager to load a player image/sprite, create a PlayerMovement,
 * and run a Konva.Animation updating the movement while started.
 *
 * Screens can instantiate this with different groups and configuration.
 */
export class PlayerManager {
    private group: Konva.Group;
    private imageUrl: string;
    private node: Konva.Image | null = null;
    private movementModel: PlayerMovementModel | null = null;
    private x: number | undefined;
    private y: number | undefined;
    private scale: number;
    private speed: number;
    private externalModel?: { x: number; y: number } | undefined;

    constructor(opts: PlayerManagerOptions) {
        this.group = opts.group;
        this.imageUrl = opts.imageUrl;
        this.x = opts.x;
        this.y = opts.y;
        this.scale = typeof opts.scale === "number" ? opts.scale : 1;
        this.speed = typeof opts.speed === "number" ? opts.speed : 150;
        this.externalModel = opts.model;

        this.load();
    }

    private load() {
        Konva.Image.fromURL(this.imageUrl, (image) => {
            // if an external model was provided, initialize the node at the model's position
            if (this.externalModel) {
                image.x(this.externalModel.x);
                image.y(this.externalModel.y);
            } else {
                // otherwise fall back to optional x/y from options
                if (typeof this.x === "number") image.x(this.x);
                if (typeof this.y === "number") image.y(this.y);
            }

            image.offsetX(image.width() / 2);
            image.offsetY(image.height() / 2);
            image.scaleX(this.scale);
            image.scaleY(this.scale);

            this.node = image;
            this.group.add(this.node);


            // create or reuse a model and a model-driven movement controller
            const model = this.x !== undefined || this.y !== undefined
                ? { x: image.x(), y: image.y() }
                : { x: image.x(), y: image.y() };
            // if caller supplied a model in options, use it instead
            const usedModel = this.externalModel ?? model;
            this.movementModel = new PlayerMovementModel(usedModel, this.speed);

            // keep model on the node in sync on load (node will be updated in update())
        });
    }

    /**
     * Update must be called by the central game loop (App) or the owning controller.
     * deltaTimeMs is milliseconds since last frame.
     */
    update(deltaTimeMs: number): void {
        if (!this.movementModel) return;

        // update model
        this.movementModel.update(deltaTimeMs);

        // apply model to node (if node loaded)
        if (this.node) {
            const m = this.movementModel.getModel();
            this.node.x(m.x);
            this.node.y(m.y);
        }
    }

    dispose() {
        if (this.movementModel) {
            this.movementModel.dispose();
            this.movementModel = null;
        }
        if (this.node) {
            this.node.destroy();
            this.node = null;
        }
    }

    // Optional helper to get the underlying node
    getNode(): Konva.Image | null {
        return this.node;
    }
}
