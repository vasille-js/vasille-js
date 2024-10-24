import { Fragment } from "../node/node";
import { Destroyable, IDestroyable } from "./destroyable.js";
import { wrongBinding } from "./errors";
import { IValue } from "./ivalue.js";
import { Expression, KindOfIValue } from "../value/expression";
import { Reference } from "../value/reference";
import { Pointer } from "../value/pointer";
import { Mirror } from "../value/mirror";

/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
export class Reactive<T extends object = object> extends Destroyable {
    /**
     * A list of user-defined values
     * @type {Set}
     */
    private _watch: Set<Destroyable> = new Set();

    /**
     * A list of user-defined bindings
     * @type {Set}
     */
    private bindings: Set<Destroyable> = new Set();

    private onDestroy?: () => void;

    public readonly input: T;

    public constructor(input: T) {
        super();
        this.input = input;
    }

    /**
     * Create a reference
     * @param value {*} value to reference
     */
    public ref<T>(value: T): IValue<T> {
        const ref = new Reference(value);
        this._watch.add(ref);
        return ref;
    }

    /**
     * Create a mirror
     * @param value {IValue} value to mirror
     */
    public mirror<T>(value: IValue<T>): Mirror<T> {
        const mirror = new Mirror(value, false);

        this._watch.add(mirror);
        return mirror;
    }

    /**
     * Create a forward-only mirror
     * @param value {IValue} value to mirror
     */
    public forward<T>(value: IValue<T>): Mirror<T> {
        const mirror = new Mirror(value, true);

        this._watch.add(mirror);
        return mirror;
    }

    /**
     * Creates a pointer
     * @param value {*} default value to point
     * @param forwardOnly {boolean} forward only sync
     */
    public point<T>(value: IValue<T>, forwardOnly = false): Pointer<T> {
        const pointer = new Pointer(value, forwardOnly);

        this._watch.add(pointer);
        return pointer;
    }

    /**
     * Register a model/dependecy
     */
    public register<T extends Destroyable>(data: T): T {
        this.bindings.add(data);

        return data;
    }

    public release(data: Destroyable): void {
        this.bindings.delete(data);
    }

    /**
     * Creates a watcher
     * @param func {function} function to run on any argument change
     * @param values
     */
    public watch<Args extends unknown[]>(func: (...args: Args) => void, ...values: KindOfIValue<Args>) {
        this._watch.add(new Expression<void, Args>(func, ...values));
    }

    /**
     * Creates a computed value
     * @param func {function} function to run on any argument change
     * @param values
     * @return {IValue} the created ivalue
     */
    public expr<T, Args extends unknown[]>(func: (...args: Args) => T, ...values: KindOfIValue<Args>): IValue<T> {
        const res: IValue<T> = new Expression<T, Args>(func, ...values);

        this._watch.add(res);
        return res;
    }

    public runOnDestroy(func: () => void) {
        if (this.onDestroy) {
            console.warn(new Error("You rewrite onDestroy existing handler"));
            console.log(this.onDestroy);
        }
        this.onDestroy = func;
    }

    public destroy() {
        super.destroy();
        this._watch.forEach(value => value.destroy());
        this._watch.clear();

        this.bindings.forEach(binding => binding.destroy());
        this.bindings.clear();

        this.onDestroy?.();
    }
}
