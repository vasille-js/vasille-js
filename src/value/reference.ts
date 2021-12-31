import { IValue } from "../core/ivalue";



/**
 * Declares a notifiable value
 * @class Reference
 * @extends IValue
 */
export class Reference<T> extends IValue<T> {
    /**
     * The encapsulated value
     * @type {*}
     */
    private value : T;

    /**
     * Array of handlers
     * @type {Set}
     * @readonly
     */
    private readonly onchange : Set<(value : T) => void>;

    /**
     * @param value {any} the initial value
     */
    public constructor (value : T) {
        super (true);
        this.value = value;
        this.onchange = new Set;
        this.$seal ();
    }

    public get $ () : T {
        return this.value;
    }

    public set $ (value : T) {
        if (this.value !== value) {
            this.value = value;

            if (this.isEnabled) {
                for (let handler of this.onchange) {
                    handler (value);
                }
            }
        }
    }

    public enable () : this {
        if (!this.isEnabled) {
            for (let handler of this.onchange) {
                handler (this.value);
            }
            this.isEnabled = true;
        }
        return this;
    }

    public disable () : this {
        this.isEnabled = false;
        return this;
    }

    public on (handler : (value : T) => void) : this {
        this.onchange.add (handler);
        return this;
    }

    public off (handler : (value : T) => void) : this {
        this.onchange.delete (handler);
        return this;
    }

    public $destroy () {
        super.$destroy ();
        this.onchange.clear ();
    }
}

