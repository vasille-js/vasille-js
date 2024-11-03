import { Destroyable } from "./destroyable.js";
import { notOverwritten } from "./errors";

/**
 * Interface which describes a value
 * @class IValue
 * @extends Destroyable
 */
export abstract class IValue<T> extends Destroyable {
    /**
     * Get the encapsulated value
     * @return {*} the encapsulated value
     */
    public abstract get $(): T;

    /**
     * Sets the encapsulated value
     * @param value {*} value to encapsulate
     */
    public abstract set $(value: T);

    /**
     * Add a new handler to value change
     * @param handler {function(value : *)} the handler to add
     */
    public abstract on(handler: (value: T) => void): void;

    /**
     * Removes a handler of value change
     * @param handler {function(value : *)} the handler to remove
     */
    public abstract off(handler: (value: T) => void): void;

    public toJSON() {
        return this.$;
    }

    public toString() {
        return this.$?.toString() ?? "iValue<void>";
    }
}
