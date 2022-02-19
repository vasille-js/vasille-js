import { IValue } from "../core/ivalue";
/**
 * Bind some values to one expression
 * @class Expression
 * @extends IValue
 */
export declare class Expression<T, T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void, T7 = void, T8 = void, T9 = void> extends IValue<T> {
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
     * @param link {Boolean} links immediately if true
     * @param v1 {*} argument
     * @param v2 {*} argument
     * @param v3 {*} argument
     * @param v4 {*} argument
     * @param v5 {*} argument
     * @param v6 {*} argument
     * @param v7 {*} argument
     * @param v8 {*} argument
     * @param v9 {*} argument
     */
    constructor(func: (a1: T1) => T, link: boolean, v1: IValue<T1>, v2?: IValue<void>, v3?: IValue<void>, v4?: IValue<void>, v5?: IValue<void>, v6?: IValue<void>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>);
    constructor(func: (a1: T1, a2: T2) => T, link: boolean, v1: IValue<T1>, v2: IValue<T2>, v3?: IValue<void>, v4?: IValue<void>, v5?: IValue<void>, v6?: IValue<void>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>);
    constructor(func: (a1: T1, a2: T2, a3: T3) => T, link: boolean, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4?: IValue<void>, v5?: IValue<void>, v6?: IValue<void>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>);
    constructor(func: (a1: T1, a2: T2, a3: T3, a4: T4) => T, link: boolean, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5?: IValue<void>, v6?: IValue<void>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>);
    constructor(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => T, link: boolean, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6?: IValue<void>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>);
    constructor(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6) => T, link: boolean, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>);
    constructor(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7) => T, link: boolean, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8?: IValue<void>, v9?: IValue<void>);
    constructor(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8) => T, link: boolean, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8: IValue<T8>, v9?: IValue<void>);
    constructor(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9) => T, link: boolean, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8: IValue<T8>, v9: IValue<T9>);
    get $(): T;
    set $(value: T);
    on(handler: (value: T) => void): this;
    off(handler: (value: T) => void): this;
    enable(): this;
    disable(): this;
    destroy(): void;
}
