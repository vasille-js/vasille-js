import { Reference } from "./reference.js";
import { IValue } from "../core/ivalue";

export type KindOfIValue<T extends unknown[]> = {
    [K in keyof T]: IValue<T[K]>;
};

/**
 * Bind some values to one expression
 * @class Expression
 * @extends IValue
 */
export class Expression<T, Args extends unknown[]> extends IValue<T> {
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
     * The function which will be executed on recalculation
     */
    private readonly func: (i?: number) => void;

    /**
     * Expression will link different handler for each value of the list
     */
    private linkedFunc: Array<() => void> = [];

    /**
     * The buffer to keep the last calculated value
     */
    private sync: Reference<T>;

    /**
     * Creates a function bounded to N values
     * @param func {Function} the function to bound
     * @param values
     * @param link {Boolean} links immediately if true
     */
    public constructor(func: (...args: Args) => T, ...values: KindOfIValue<Args>) {
        super();
        const handler = (i?: number) => {
            if (typeof i === "number") {
                this.valuesCache[i] = this.values[i].$;
            }
            this.sync.$ = func.apply(this, this.valuesCache);
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.valuesCache = values.map(item => item.$);

        this.sync = new Reference(func.apply(this, this.valuesCache));

        let i = 0;
        values.forEach(value => {
            const updater = handler.bind(this, Number(i++));

            this.linkedFunc.push(updater);
            value.on(updater);
        });

        this.values = values;
        this.func = handler;
    }

    public get $(): T {
        return this.sync.$;
    }

    public set $(value: T) {
        this.sync.$ = value;
    }

    public on(handler: (value: T) => void): void {
        this.sync.on(handler);
    }

    public off(handler: (value: T) => void): void {
        this.sync.off(handler);
    }

    public destroy(): void {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i].off(this.linkedFunc[i]);
        }
        this.values.splice(0);
        this.valuesCache.splice(0);
        this.linkedFunc.splice(0);

        super.destroy();
    }
}
