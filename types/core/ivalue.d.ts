import { Destroyable } from "./destroyable.js";
/**
 * Interface which describes a value
 * @class IValue
 * @extends Destroyable
 */
export declare class IValue<T> extends Destroyable {
    /**
     * Is enabled state flag
     * @protected
     */
    protected isEnabled: boolean;
    /**
     * @param isEnabled {boolean} initial is enabled state
     */
    constructor(isEnabled: boolean);
    /**
     * Get the encapsulated value
     * @return {*} the encapsulated value
     */
    get $(): T;
    /**
     * Sets the encapsulated value
     * @param value {*} value to encapsulate
     */
    set $(value: T);
    /**
     * Add a new handler to value change
     * @param handler {function(value : *)} the handler to add
     */
    on(handler: (value: T) => void): this;
    /**
     * Removes a handler of value change
     * @param handler {function(value : *)} the handler to remove
     */
    off(handler: (value: T) => void): this;
    /**
     * Enable update handlers triggering
     */
    enable(): this;
    /**
     * disable update handlers triggering
     */
    disable(): this;
}
