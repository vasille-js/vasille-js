import { Reactive } from "../core/core.js";
import { IValue } from "../core/ivalue.js";

export abstract class SyncedIValue<T> extends IValue<T> {
    protected sync: IValue<T>;

    protected constructor(sync: IValue<T>, ctx?: Reactive) {
        super(ctx?.sDeep ?? 0);
        this.sync = sync;
    }

    public on(handler: (value: T) => void): void {
        this.sync.on(handler);
    }

    public off(handler: (value: T) => void): void {
        this.sync.off(handler);
    }
}
