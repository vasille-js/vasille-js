import { IValue } from "../core/ivalue";
export declare type KindOfIValue<T extends unknown[]> = {
    [K in keyof T]: IValue<T[K]>;
};
/**
 * Bind some values to one expression
 * @class Expression
 * @extends IValue
 */
export declare class Expression<T, Args extends unknown[]> extends IValue<T> {
    /**
     * The array of value which will trigger recalculation
     * @type {Array}
     */
    private values;
    /**
     * Cache the values of expression variables
     * @type {Array}
     */
    private readonly valuesCache;
    /**
     * The function which will be executed on recalculation
     */
    private readonly func;
    /**
     * Expression will link different handler for each value of list
     */
    private linkedFunc;
    /**
     * The buffer to keep the last calculated value
     */
    private sync;
    /**
     * Creates a function bounded to N values
     * @param func {Function} the function to bound
     * @param values
     * @param link {Boolean} links immediately if true
     */
    constructor(func: (...args: Args) => T, link: boolean, ...values: KindOfIValue<Args>);
    get $(): T;
    set $(value: T);
    on(handler: (value: T) => void): this;
    off(handler: (value: T) => void): this;
    enable(): this;
    disable(): this;
    destroy(): void;
}
