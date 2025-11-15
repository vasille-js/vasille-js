import { Reactive } from "../core/core.js";
import { InspectableReactive, Inspector, provideId } from "./inspectable.js";

export class DevReactive extends Reactive implements InspectableReactive {
    public readonly id: number;
    public readonly inspector: Inspector | undefined;

    public constructor(inspector: Inspector | undefined) {
        super();
        this.id = provideId();
        this.inspector = inspector;
    }

    public destroy() {
        this.inspector?.destroy(this.id);
    }
}
