import { Reactive } from "../core/core.js";
import { Destroyable } from "../core/destroyable.js";
import { IValue } from "../core/ivalue.js";
import { SyncedIValue } from "./synced.js";

export class FieldReference extends SyncedIValue<unknown> implements Destroyable {
    protected readonly object: IValue<object | undefined | null>;
    protected readonly updated: (v: unknown) => object;
    protected readonly handler: (v: object | undefined | null) => void;

    public constructor(
        createRef: (v: unknown, ctx?: Reactive) => IValue<unknown>,
        object: IValue<object | undefined | null>,
        getValue: (v: object | undefined | null) => unknown,
        update: (v: unknown) => object,
        ctx?: Reactive,
    ) {
        super(createRef(getValue(object.V), ctx), ctx);

        object.on((this.handler = (v: object | undefined | null) => (this.sync.V = getValue(v))));

        this.object = object;
        this.updated = update;

        this.rDeep = object.sDeep;
        if (ctx && ctx.sDeep > object.sDeep) {
            ctx.bind(this);
        }
    }

    public get V(): unknown {
        return this.sync.V;
    }
    public set V(value: unknown) {
        this.object.V = this.updated(value);
    }

    public destroy(): void {
        this.object.off(this.handler);
    }
}

export class SingleFieldReference extends FieldReference {
    public constructor(
        createRef: (v: unknown, ctx?: Reactive) => IValue<unknown>,
        object: IValue<object | undefined | null>,
        field: string | symbol,
        ctx?: Reactive,
    ) {
        super(
            createRef,
            object,
            o => o?.[field],
            value => ({ ...object.V, [field]: value }),
            ctx,
        );
    }
}

export class DeepFieldReference extends FieldReference {
    public constructor(
        createRef: (v: unknown, ctx?: Reactive) => IValue<unknown>,
        object: IValue<object | undefined | null>,
        fields: (string | symbol)[],
        ctx?: Reactive,
    ) {
        super(
            createRef,
            object,
            o => {
                let it: unknown = o;

                for (const field of fields) {
                    if (typeof it === "object" && it !== null) {
                        it = (it as Record<string | symbol, unknown>)[field];
                    } else {
                        return undefined;
                    }
                }
                return it;
            },
            value => {
                let it: unknown = object.V;
                const track: (Record<string | symbol, unknown> | undefined)[] = [
                    it as Record<string | symbol, unknown> | undefined,
                ];

                for (let i = 0; i < fields.length - 1; i++) {
                    if (typeof it === "object" && it !== null) {
                        it = (it as Record<string | symbol, unknown>)[fields[i]!];
                    } else {
                        it = {};
                    }
                    track.push(it as Record<string | symbol, unknown> | undefined);
                }
                for (let i = track.length - 1; i >= 0; i--) {
                    const field = fields[i]!;

                    track[i] = { ...track[i]!, [field]: i === track.length - 1 ? value : track[i + 1] };
                }
                return track[0] as object;
            },
            ctx,
        );
    }
}
