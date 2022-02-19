import { Reference } from "./reference.js";
import { IValue } from "../core/ivalue";


/**
 * Bind some values to one expression
 * @class Expression
 * @extends IValue
 */
export class Expression<
    T, T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void, T7 = void, T8 = void, T9 = void
> extends IValue<T> {
    /**
     * The array of value which will trigger recalculation
     * @type {Array}
     */
    private values : [
        IValue<T1>,
        IValue<T2>,
        IValue<T3>,
        IValue<T4>,
        IValue<T5>,
        IValue<T6>,
        IValue<T7>,
        IValue<T8>,
        IValue<T9>
    ];

    /**
     * Cache the values of expression variables
     * @type {Array}
     */
    private readonly valuesCache : [T1, T2, T3, T4, T5, T6, T7, T8, T9];

    /**
     * The function which will be executed on recalculation
     */
    private readonly func : (i ? : number) => void;

    /**
     * Expression will link different handler for each value of list
     */
    private linkedFunc : Array<() => void> = [];

    /**
     * The buffer to keep the last calculated value
     */
    private sync : Reference<T>;

    /**
     * Creates a function bounded to N values
     * @param func {Function} the function to bound
     * @param link {Boolean} links immediately if true
     * @param v1 {*} argument
     * @param v2 {*} argument
     * @param v3 {*} argument
     * @param v4 {*} argument
     * @param v5 {*} argument
     * @param v6 {*} argument
     * @param v7 {*} argument
     * @param v8 {*} argument
     * @param v9 {*} argument
     */
    public constructor (
        func : (a1 : T1) => T,
        link : boolean,
        v1 : IValue<T1>, v2 ?: IValue<void>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public constructor (
        func : (a1 : T1, a2 : T2) => T,
        link : boolean,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public constructor (
        func : (a1 : T1, a2 : T2, a3 : T3) => T,
        link : boolean,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => T,
        link : boolean,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => T,
        link : boolean,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => T,
        link : boolean,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => T,
        link : boolean,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => T,
        link : boolean,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 ?: IValue<void>,
    )
    public constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => T,
        link : boolean,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    )
    public constructor (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => T,
        link : boolean,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) {
        super (false);
        const values = [v1, v2, v3, v4, v5, v6, v7, v8, v9].filter(v => v instanceof IValue);
        const handler = (i ? : number) => {
            if (i != null) {
                this.valuesCache[i] = this.values[i].$;
            }
            this.sync.$ = func.apply (this, this.valuesCache);
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.valuesCache = values.map (iValue => iValue.$);
        this.sync = new Reference(func.apply (this, this.valuesCache));

        let i = 0;
        values.forEach(() => {
            this.linkedFunc.push (handler.bind (this, Number (i++)));
        });

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.values = values;
        this.func = handler;

        if (link) {
            this.enable ();
        } else {
            handler ();
        }

        this.seal ();
    }

    public get $ () : T {
        return this.sync.$;
    }

    public set $ (value : T) {
        this.sync.$ = value;
    }

    public on (handler : (value : T) => void) : this {
        this.sync.on (handler);
        return this;
    }

    public off (handler : (value : T) => void) : this {
        this.sync.off (handler);
        return this;
    }

    public enable () : this {
        if (!this.isEnabled) {
            for (let i = 0; i < this.values.length; i++) {
                this.values[i].on (this.linkedFunc[i]);
                this.valuesCache[i] = this.values[i].$;
            }
            this.func ();
            this.isEnabled = true;
        }
        return this;
    }

    public disable () : this {
        if (this.isEnabled) {
            for (let i = 0; i < this.values.length; i++) {
                this.values[i].off (this.linkedFunc[i]);
            }
            this.isEnabled = false;
        }
        return this;
    }

    public destroy () : void {
        this.disable ();
        this.values.splice (0);
        this.valuesCache.splice (0);
        this.linkedFunc.splice (0);

        super.destroy();
    }
}
