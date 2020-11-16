// @flow
import { Destroyable } from "./destroyable.js";



/**
 * A interface which describes a value
 * @interface
 * @implements Destroyable
 */
export class IValue<T> extends Destroyable {
    /**
     * Gets the encapsulated value
     * @return {*} Must return a value
     * @throws Must be overwritten
     */
    get() : T {
        throw "Must be overwritten";
    }

    /**
     * Sets the encapsulated value
     * @param value {*} Value to encapsulate
     * @return {IValue} A pointer to this
     * @throws Must be overwritten
     */
    set(value : T) : this {
        throw "Must be overwritten";
    }

    /**
     * Add a new handler to value change
     * @param handler {Function} The handler to add
     * @return {IValue} a pointer to this
     * @throws Must be overwritten
     */
    on(handler : Function) : this {
        throw "Must be overwritten";
    }

    /**
     * Removes a handler of value change
     * @param handler {Function} the handler to remove
     * @return {IValue} a pointer to this
     * @throws Must be overwritten
     */
    off(handler : Function) : this {
        throw "Must be overwritten";
    }
}
