import { Reactive } from "../core/core.js";
import { IDevRunner, InspectableReactive, provideId } from "./inspectable.js";

export class DevReactive<Runner extends IDevRunner<unknown, unknown, object>>
    extends Reactive
    implements InspectableReactive
{
    public readonly id: number;
    public readonly runner: Pick<Runner, "inspector">;

    public constructor(runner: Pick<Runner, "inspector">) {
        super();
        this.id = provideId();
        this.runner = runner;
    }

    public override destroy() {
        this.runner.inspector.destroy({ id: this.id, time: Date.now() });
        super.destroy();
    }
}
