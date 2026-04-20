import { Reactive } from "../core/core.js";
import { InspectableReactive, inspector, provideId } from "./inspectable.js";

export class DevReactive extends Reactive implements InspectableReactive {
    public readonly id: number;

    public constructor() {
        super(1);
        this.rDeep = 0;
        this.id = provideId();
    }

    public override destroy(deep: number) {
        inspector.destroy({ id: this.id, time: Date.now() });
        super.destroy(deep);
    }
}
