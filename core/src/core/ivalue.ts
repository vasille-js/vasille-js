/**
 * Interface which describes a value
 * @class IValue
 */
export abstract class IValue<T> {
    /**
     * Get the encapsulated value
     * @return {*} the encapsulated value
     */
    public abstract get V(): T;

    /**
     * Sets the encapsulated value
     * @param value {*} value to encapsulate
     */
    public abstract set V(value: T);

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
        return this.V;
    }

    public toString() {
        return this.V?.toString() ?? "iValue<void>";
    }
}
