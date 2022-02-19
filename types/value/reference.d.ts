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
    enable(): void;
    disable(): void;
    on(handler: (value: T) => void): void;
    off(handler: (value: T) => void): void;
    destroy(): void;
}
