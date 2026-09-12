import { Reactive } from "../core/core.js";
import { IValue } from "../core/ivalue.js";
import { SyncedIValue } from "./synced.js";

export class EdgeReference<T> extends SyncedIValue<T> {
    public readonly getter: () => T;
    public readonly setter: (v: T) => void;

    public constructor(
        createRef: (v: T, ctx?: Reactive) => IValue<T>,
        getter: () => T,
        setter: (v: T) => void,
        ctx?: Reactive,
        subscriber?: (setter: (v: T) => void) => void | (() => void),
    ) {
        super(createRef(getter(), ctx), ctx);

        this.getter = getter;
        this.setter = setter;

        const unsubscribe = subscriber?.(v => (this.sync.V = v));

        if (unsubscribe && ctx) {
            ctx.runOnDestroy(unsubscribe);
        }
    }

    public get V(): T {
        return this.sync.V;
    }
    public set V(value: T) {
        this.setter(value);
        this.sync.V = this.getter();
    }
}
