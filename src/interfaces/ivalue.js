// @flow
import { Destroyable }    from "./destroyable.js";
import { notOverwritten } from "./errors";



/**
 * A interface which describes a value
 * @interface
 * @implements Destroyable
 */
export class IValue<T> extends Destroyable {

    /**
     * Used for strong type checking
     * @type {?Function}
     */
    type : ?Function = null;

    /**
     * Gets the encapsulated value
     * @return {*} Must return a value
     * @throws Must be overwritten
     */
    get $ () : T {
        throw notOverwritten();
    }

    /**
     * Sets the encapsulated value
     * @param value {*} Reference to encapsulate
     * @return {IValue} A pointer to this
     * @throws Must be overwritten
     */
    set $ (value : T) : this {
        throw notOverwritten();
    }

    /**
     * Add a new handler to value change
     * @param handler {Function} The handler to add
     * @return {IValue} a pointer to this
     * @throws Must be overwritten
     */
    on (handler : Function) : this {
        throw notOverwritten();
    }

    /**
     * Removes a handler of value change
     * @param handler {Function} the handler to remove
     * @return {IValue} a pointer to this
     * @throws Must be overwritten
     */
    off (handler : Function) : this {
        throw notOverwritten();
    }
}
