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
    value : T;

    /**
     * Array of handlers
     * @type {Set<Function>}
     */
    onchange : Set<(value : T) => void>;

    /**
     * Constructs a notifiable value
     * @param value {any} is initial value
     */
    constructor (value : T) {
        super (true);
        this.value = value;
        this.onchange = new Set;
        this.$seal ();
    }

    /**
     * Gets the notifiable value as js value
     * @returns {any} contained value
     */
    get $ () : T {
        return this.value;
    }

    /**
     * Sets the value and notify listeners
     * @param value {any} is the new value
     * @returns {Reference} a pointer to this
     */
    set $ (value : T) : this {
        if (this.value !== value) {
            this.value = value;

            if (this.isEnabled) {
                for (let handler of this.onchange) {
                    handler (value);
                }
            }
        }

        return this;
    }

    enable () : this {
        if (!this.isEnabled) {
            for (let handler of this.onchange) {
                handler (this.value);
            }
            this.isEnabled = true;
        }
        return this;
    }
    
    disable () : this {
        this.isEnabled = false;
        return this;
    }

    /**
     * Adds a new handler for value change
     * @param handler {function} is a user-defined event handler
     * @returns {Reference} a pointer to this
     */
    on (handler : (value : T) => void) : this {
        this.onchange.add (handler);
        return this;
    }

    /**
     * Removes a new handler for value change
     * @param handler {function} is a existing user-defined handler
     * @returns {Reference} a pointer to this
     */
    off (handler : (value : T) => void) : this {
        this.onchange.delete (handler);
        return this;
    }

    /**
     * Runs GC
     */
    $destroy () {
        super.$destroy ();
        this.onchange.clear ();
    }
}

