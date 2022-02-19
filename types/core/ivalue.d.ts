import { Destroyable } from "./destroyable.js";
export declare class Switchable extends Destroyable {
    /**
     * Enable update handlers triggering
     */
    enable(): void;
    /**
     * disable update handlers triggering
     */
    disable(): void;
}
/**
 * Interface which describes a value
 * @class IValue
 * @extends Destroyable
 */
export declare class IValue<T> extends Switchable {
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
    on(handler: (value: T) => void): void;
    /**
     * Removes a handler of value change
     * @param handler {function(value : *)} the handler to remove
     */
    off(handler: (value: T) => void): void;
}
