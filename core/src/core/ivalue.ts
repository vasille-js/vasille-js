import { Destroyable } from "./destroyable.js";
import { notOverwritten } from "./errors";

/**
 * Interface which describes a value
 * @class IValue
 * @extends Destroyable
 */
export class IValue<T> extends Destroyable {
    /**
     * @param isEnabled {boolean} initial is enabled state
     */
    public constructor() {
        super();
    }

    /**
     * Get the encapsulated value
     * @return {*} the encapsulated value
     */
    public get $(): T {
        throw notOverwritten();
    }

    /**
     * Sets the encapsulated value
     * @param value {*} value to encapsulate
     */
    public set $(value: T) {
        throw notOverwritten();
    }

    /**
     * Add a new handler to value change
     * @param handler {function(value : *)} the handler to add
     */
    public on(handler: (value: T) => void): void {
        throw notOverwritten();
    }

    /**
     * Removes a handler of value change
     * @param handler {function(value : *)} the handler to remove
     */
    public off(handler: (value: T) => void): void {
        throw notOverwritten();
    }

    public toJSON() {
        return this.$;
    }

    public toString() {
        return this.$?.toString() ?? "iValue<void>";
    }
}
