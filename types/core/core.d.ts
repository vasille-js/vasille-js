import { Destroyable } from "./destroyable.js";
import { IValue } from "./ivalue.js";
import { Expression } from "../value/expression";
import { Pointer } from "../value/pointer";
import { Mirror } from "../value/mirror";
import { IModel } from "../models/model";
/**
 * Private stuff of a reactive object
 * @class ReactivePrivate
 * @extends Destroyable
 */
export declare class ReactivePrivate extends Destroyable {
    /**
     * A list of user-defined values
     * @type {Set}
     */
    watch: Set<IValue<unknown>>;
    /**
     * A list of user-defined bindings
     * @type {Set}
     */
    bindings: Set<Destroyable>;
    /**
     * A list of user defined models
     */
    models: Set<IModel<any, any>>;
    /**
     * Reactivity switch state
     * @type {boolean}
     */
    enabled: boolean;
    /**
     * The frozen state of object
     * @type {boolean}
     */
    frozen: boolean;
    /**
     * An expression which will freeze/unfreeze the object
     * @type {IValue<void>}
     */
    freezeExpr: Expression<void, boolean>;
    constructor();
    $destroy(): void;
}
/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
export declare class Reactive extends Destroyable {
    /**
     * Private stuff
     * @protected
     */
    protected $: ReactivePrivate;
    constructor($?: ReactivePrivate);
    /**
     * Create a reference
     * @param value {*} value to reference
     */
    $ref<T>(value: T): IValue<T>;
    /**
     * Create a mirror
     * @param value {IValue} value to mirror
     * @param forwardOnly {boolean} forward only sync
     */
    $mirror<T>(value: IValue<T>, forwardOnly?: boolean): Mirror<T>;
    /**
     * Creates a pointer
     * @param value {*} default value to point
     * @param forwardOnly {boolean} forward only sync
     */
    $point<T>(value: T | IValue<T>, forwardOnly?: boolean): Pointer<T>;
    /**
     * Register a model
     * @param model
     */
    $register<T extends IModel<any, any>>(model: T): T;
    /**
     * Creates a watcher
     * @param func {function} function to run on any argument change
     * @param v1 {IValue} argument
     * @param v2 {IValue} argument
     * @param v3 {IValue} argument
     * @param v4 {IValue} argument
     * @param v5 {IValue} argument
     * @param v6 {IValue} argument
     * @param v7 {IValue} argument
     * @param v8 {IValue} argument
     * @param v9 {IValue} argument
     */
    $watch<T1>(func: (a1: T1) => void, v1: IValue<T1>): any;
    $watch<T1, T2>(func: (a1: T1, a2: T2) => void, v1: IValue<T1>, v2: IValue<T2>): any;
    $watch<T1, T2, T3>(func: (a1: T1, a2: T2, a3: T3) => void, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>): any;
    $watch<T1, T2, T3, T4>(func: (a1: T1, a2: T2, a3: T3, a4: T4) => void, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>): any;
    $watch<T1, T2, T3, T4, T5>(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => void, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>): any;
    $watch<T1, T2, T3, T4, T5, T6>(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6) => void, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>): any;
    $watch<T1, T2, T3, T4, T5, T6, T7>(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7) => void, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>): any;
    $watch<T1, T2, T3, T4, T5, T6, T7, T8>(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8) => void, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8: IValue<T8>): any;
    $watch<T1, T2, T3, T4, T5, T6, T7, T8, T9>(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9) => void, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8: IValue<T8>, v9: IValue<T9>): any;
    /**
     * Creates a computed value
     * @param func {function} function to run on any argument change
     * @param v1 {IValue} argument
     * @param v2 {IValue} argument
     * @param v3 {IValue} argument
     * @param v4 {IValue} argument
     * @param v5 {IValue} argument
     * @param v6 {IValue} argument
     * @param v7 {IValue} argument
     * @param v8 {IValue} argument
     * @param v9 {IValue} argument
     * @return {IValue} the created ivalue
     */
    $bind<T, T1>(func: (a1: T1) => T, v1: IValue<T1>): any;
    $bind<T, T1, T2>(func: (a1: T1, a2: T2) => T, v1: IValue<T1>, v2: IValue<T2>): any;
    $bind<T, T1, T2, T3>(func: (a1: T1, a2: T2, a3: T3) => T, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>): any;
    $bind<T, T1, T2, T3, T4>(func: (a1: T1, a2: T2, a3: T3, a4: T4) => T, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>): any;
    $bind<T, T1, T2, T3, T4, T5>(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => T, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>): any;
    $bind<T, T1, T2, T3, T4, T5, T6>(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6) => T, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>): any;
    $bind<T, T1, T2, T3, T4, T5, T6, T7>(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7) => T, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>): any;
    $bind<T, T1, T2, T3, T4, T5, T6, T7, T8>(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8) => T, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8: IValue<T8>): any;
    $bind<T, T1, T2, T3, T4, T5, T6, T7, T8, T9>(func: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9) => T, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8: IValue<T8>, v9: IValue<T9>): any;
    /**
     * Enable reactivity of fields
     */
    $enable(): void;
    /**
     * Disable reactivity of fields
     */
    $disable(): void;
    /**
     * Disable/Enable reactivity of object fields with feedback
     * @param cond {IValue} show condition
     * @param onOff {function} on show feedback
     * @param onOn {function} on hide feedback
     */
    $bindAlive(cond: IValue<boolean>, onOff?: () => void, onOn?: () => void): this;
    $destroy(): void;
}
