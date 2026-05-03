import { Reactive } from "../core/core.js";
import { Destroyable } from "../core/destroyable.js";
import { safe } from "../functional/safety.js";
import { IValue } from "../core/ivalue.js";

export type KindOfIValue<T extends unknown[]> = {
    [K in keyof T]: IValue<T[K]> | undefined;
};

/**
 * Bind some values to one expression
 * @class Expression
 * @extends IValue
 */
export class Expression<T, Args extends unknown[]> extends IValue<T> implements Destroyable {
    /**
     * The array of value which will trigger recalculation
     * @type {Array}
     */
    private values: KindOfIValue<Args>;

    /**
     * Cache the values of expression variables
     * @type {Array}
     */
    private readonly valuesCache: Args;

    /**
     * Expression will link different handler for each value of the list
     */
    private linkedFunc: Array<() => void> = [];

    /**
     * The buffer to keep the last calculated value
     */
    protected sync: IValue<T>;

    /**
     * Creates a function bounded to N values
     */
    public constructor(
        func: (...args: Args) => T,
        ref: (args: Args) => IValue<T>,
        values: KindOfIValue<Args>,
        ctx?: Reactive,
    ) {
        super(ctx?.sDeep ?? 0);
        const handler = safe((i?: number) => {
            /* istanbul ignore else */
            if (typeof i === "number") {
                this.valuesCache[i] = this.values[i]?.V;
            }
            this.sync.V = func.apply(this, this.valuesCache);
        });

        this.sync = ref((this.valuesCache = values.map(item => item?.V) as Args));

        let i = 0;
        let deep = -1;
        values.forEach(value => {
            const updater = handler.bind(this, Number(i++));

            if (value && (deep === -1 || value.rDeep < deep)) {
                deep = value.rDeep;
            }
            this.linkedFunc.push(updater);
            value?.on(updater);
        });

        this.values = values;
        this.rDeep = deep;
        if (ctx && ctx.sDeep > deep) {
            ctx.bind(this);
        }
    }

    public get V(): T {
        return this.sync.V;
    }

    public set V(value: T) {
        this.sync.V = value;
    }

    public on(handler: (value: T) => void): void {
        this.sync.on(handler);
    }

    public off(handler: (value: T) => void): void {
        this.sync.off(handler);
    }

    public destroy(): void {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i]?.off(this.linkedFunc[i]!);
        }
        this.values.splice(0);
        this.valuesCache.splice(0);
        this.linkedFunc.splice(0);
    }
}
