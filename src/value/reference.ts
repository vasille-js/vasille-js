// @flow
import { IValue } from "../core/ivalue";



/**
 * Declares a notifiable value
 * @implements IValue
 */
export class Reference<T> extends IValue<T> {
    /**
     * The encapsulated value
     * @type {*}
     */
    private value : T;

    /**
     * Array of handlers
     * @type {Set<Function>}
     */
    private readonly onchange : Set<(value : T) => void>;

    /**
     * Constructs a notifiable value
     * @param value {any} is initial value
     */
    public constructor (value : T) {
        super (true);
        this.value = value;
        this.onchange = new Set;
        this.$seal ();
    }

    /**
     * Gets the notifiable value as js value
     * @returns {any} contained value
     */
    public get $ () : T {
        return this.value;
    }

    /**
     * Sets the value and notify listeners
     * @param value {any} is the new value
     * @returns {Reference} a pointer to this
     */
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

    /**
     * Adds a new handler for value change
     * @param handler {function} is a user-defined event handler
     * @returns {Reference} a pointer to this
     */
    public on (handler : (value : T) => void) : this {
        this.onchange.add (handler);
        return this;
    }

    /**
     * Removes a new handler for value change
     * @param handler {function} is a existing user-defined handler
     * @returns {Reference} a pointer to this
     */
    public off (handler : (value : T) => void) : this {
        this.onchange.delete (handler);
        return this;
    }

    /**
     * Runs GC
     */
    public $destroy () {
        super.$destroy ();
        this.onchange.clear ();
    }
}

