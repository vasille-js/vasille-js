import { Reactive } from "../core/core.js";
import { Destroyable } from "../core/destroyable.js";
import { IValue } from "../core/ivalue.js";
import { SyncedIValue } from "./synced.js";

export class DebounceReference<T> extends SyncedIValue<T> implements Destroyable {
    protected readonly target: IValue<T>;
    protected readonly handler: (v: T) => void;
    protected timer: ReturnType<typeof setTimeout> | undefined;

    public constructor(
        createRef: (v: T, ctx?: Reactive) => IValue<T>,
        target: IValue<T>,
        delay: number,
        ctx?: Reactive,
    ) {
        super(createRef(target.V, ctx), ctx);

        target.on(
            (this.handler = (v: T) => {
                clearTimeout(this.timer);
                this.timer = setTimeout(() => {
                    this.sync.V = v;
                }, delay);
            }),
        );
        this.target = target;

        this.rDeep = target.sDeep;
        if (ctx && ctx.sDeep > target.sDeep) {
            ctx.bind(this);
        }
    }

    public get V(): T {
        return this.sync.V;
    }
    public set V(value: T) {
        this.target.V = value;
    }

    public destroy(): void {
        clearTimeout(this.timer);
        this.target.off(this.handler);
    }
}
