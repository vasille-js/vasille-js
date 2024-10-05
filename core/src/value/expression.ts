import { Reference } from "./reference.js";
import { IValue } from "../core/ivalue";



export type KindOfIValue<T extends unknown[]> = { [K in keyof T]: IValue<T[K]> };

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
    private values : KindOfIValue<Args>;

    /**
     * Cache the values of expression variables
     * @type {Array}
     */
    private readonly valuesCache : Args;

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
     * @param values
     * @param link {Boolean} links immediately if true
     */
    public constructor (
        func : (...args: Args) => T,
        link : boolean,
        ...values : KindOfIValue<Args>
    ) {
        super (false);
        const handler = (i ? : number) => {
            if (i != null) {
                this.valuesCache[i] = this.values[i].$;
            }
            this.sync.$ = func.apply (this, this.valuesCache);
        };

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.valuesCache = values.map(item => item.$);

        this.sync = new Reference(func.apply (this, this.valuesCache));

        let i = 0;
        values.forEach(() => {
            this.linkedFunc.push (handler.bind (this, Number (i++)));
        });

        this.values = values;
        this.func = handler;

        if (link) {
            this.$enable ();
        } else {
            handler ();
        }

        this.$seal ();
    }

    public get $ () : T {
        return this.sync.$;
    }

    public set $ (value : T) {
        this.sync.$ = value;
    }

    public $on (handler : (value : T) => void) : this {
        this.sync.$on (handler);
        return this;
    }

    public $off (handler : (value : T) => void) : this {
        this.sync.$off (handler);
        return this;
    }

    public $enable () : this {
        if (!this.isEnabled) {
            for (let i = 0; i < this.values.length; i++) {
                this.values[i].$on (this.linkedFunc[i]);
                this.valuesCache[i] = this.values[i].$;
            }
            this.func ();
            this.isEnabled = true;
        }
        return this;
    }

    public $disable () : this {
        if (this.isEnabled) {
            for (let i = 0; i < this.values.length; i++) {
                this.values[i].$off (this.linkedFunc[i]);
            }
            this.isEnabled = false;
        }
        return this;
    }

    public $destroy () : void {
        this.$disable ();
        this.values.splice (0);
        this.valuesCache.splice (0);
        this.linkedFunc.splice (0);

        super.$destroy();
    }
}
