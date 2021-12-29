// @flow
import { Destroyable } from "./destroyable.js";
import { notOverwritten } from "./errors";


/**
 * A interface which describes a value
 * @interface
 * @extends Destroyable
 */
export class IValue<T> extends Destroyable {

    isEnabled : boolean;

    constructor (isEnabled : boolean = false) {
        super ();
        this.isEnabled = isEnabled;
    }

    /**
     * Gets the encapsulated value
     * @return {*} Must return a value
     * @throws Must be overwritten
     */
    get $ () : T {
        throw notOverwritten ();
    }

    /**
     * Sets the encapsulated value
     * @param value {*} Reference to encapsulate
     * @return {IValue} A pointer to this
     * @throws Must be overwritten
     */
    set $ (value : T) : this {
        throw notOverwritten ();
    }

    /**
     * Add a new handler to value change
     * @param handler {Function} The handler to add
     * @return {IValue} a pointer to this
     * @throws Must be overwritten
     */
    on (handler : (value : T) => void) : this {
        throw notOverwritten ();
    }

    /**
     * Removes a handler of value change
     * @param handler {Function} the handler to remove
     * @return {IValue} a pointer to this
     * @throws Must be overwritten
     */
    off (handler : (value : T) => void) : this {
        throw notOverwritten ();
    }

    /**
     * Enable update handlers triggering
     */
    enable () : this {
        throw notOverwritten();
    }

    /**
     * disable update handlers triggering
     */
    disable () : this {
        throw notOverwritten();
    }
}
