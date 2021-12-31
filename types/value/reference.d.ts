import { IValue } from "../core/ivalue";
/**
 * Declares a notifiable value
 * @class Reference
 * @extends IValue
 */
export declare class Reference<T> extends IValue<T> {
    /**
     * The encapsulated value
     * @type {*}
     */
    private value;
    /**
     * Array of handlers
     * @type {Set}
     * @readonly
     */
    private readonly onchange;
    /**
     * @param value {any} the initial value
     */
    constructor(value: T);
    get $(): T;
    set $(value: T);
    enable(): this;
    disable(): this;
    on(handler: (value: T) => void): this;
    off(handler: (value: T) => void): this;
    $destroy(): void;
}
