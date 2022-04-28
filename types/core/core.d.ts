import { Destroyable } from "./destroyable.js";
import { IValue, Switchable } from "./ivalue.js";
import { Expression, KindOfIValue } from "../value/expression";
import { Pointer } from "../value/pointer";
import { Mirror } from "../value/mirror";
import { IModel } from "../models/model";
import { Options } from "../functional/options";
export declare let current: Reactive | null;
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
    watch: Set<Switchable>;
    /**
     * A list of user-defined bindings
     * @type {Set}
     */
    bindings: Set<Destroyable>;
    /**
     * A list of user defined models
     */
    models: Set<IModel>;
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
    freezeExpr: Expression<void, [boolean]>;
    /**
     * Parent node
     * @type {Reactive}
     */
    parent: Reactive;
    onDestroy?: () => void;
    constructor();
    destroy(): void;
}
/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
export declare class Reactive<T extends Options = Options> extends Destroyable {
    /**
     * Private stuff
     * @protected
     */
    protected $: ReactivePrivate;
    input: T;
    constructor(input: T, $?: ReactivePrivate);
    /**
     * Get parent node
     */
    get parent(): Reactive;
    /**
     * Create a reference
     * @param value {*} value to reference
     */
    ref<T>(value: T): IValue<T>;
    /**
     * Create a mirror
     * @param value {IValue} value to mirror
     */
    mirror<T>(value: IValue<T>): Mirror<T>;
    /**
     * Create a forward-only mirror
     * @param value {IValue} value to mirror
     */
    forward<T>(value: IValue<T>): Mirror<T>;
    /**
     * Creates a pointer
     * @param value {*} default value to point
     * @param forwardOnly {boolean} forward only sync
     */
    point<T>(value: IValue<T>, forwardOnly?: boolean): Pointer<T>;
    /**
     * Register a model
     * @param model
     */
    register<T extends IModel>(model: T): T;
    /**
     * Creates a watcher
     * @param func {function} function to run on any argument change
     * @param values
     */
    watch<Args extends unknown[]>(func: (...args: Args) => void, ...values: KindOfIValue<Args>): void;
    /**
     * Creates a computed value
     * @param func {function} function to run on any argument change
     * @param values
     * @return {IValue} the created ivalue
     */
    expr<T, Args extends unknown[]>(func: (...args: Args) => T, ...values: KindOfIValue<Args>): IValue<T>;
    /**
     * Enable reactivity of fields
     */
    enable(): void;
    /**
     * Disable reactivity of fields
     */
    disable(): void;
    /**
     * Disable/Enable reactivity of object fields with feedback
     * @param cond {IValue} show condition
     * @param onOff {function} on show feedback
     * @param onOn {function} on hide feedback
     */
    bindAlive(cond: IValue<boolean>, onOff?: () => void, onOn?: () => void): this;
    init(): void;
    protected applyOptions(input: T): void;
    protected compose(input: T): void;
    runFunctional<F extends (...args: any) => any>(f: F, ...args: Parameters<F>): ReturnType<F>;
    runOnDestroy(func: () => void): void;
    destroy(): void;
}
