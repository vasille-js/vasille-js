import { Destroyable } from "./destroyable.js";
import { IValue } from "./ivalue.js";
import { Expression, KindOfIValue } from "../value/expression.js";
import { Reference } from "../value/reference.js";
import { OwningPointer, Pointer } from "../value/pointer.js";

/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
export class Reactive<T extends object = object> extends Destroyable {
    /**
     * A list of user-defined bindings
     * @type {Set}
     */
    private bindings: Set<Destroyable> = new Set();

    private onDestroy?: () => void;

    public readonly input: T;
    public readonly state: Record<string, [string, unknown]>;

    public constructor(input: T) {
        super();
        this.input = input;
        this.state = {};
    }

    /**
     * Create a reference
     * @param value {*} value to reference
     * @param name {string} used for debugging internal state
     */
    public ref<T>(value: T, name?: string): IValue<T> {
        const ref = new Reference(value);

        this.bindings.add(ref);
        if (name) {
            this.addState("ref", name, ref);
        }

        return ref;
    }

    /**
     * Create a forward-only pointer
     * @param value {IValue} value to point
     * @param name {string} used for debugging internal state
     */
    public forward<T>(value: IValue<T>, name?: string): IValue<T> {
        const mirror = new Pointer(value);

        this.bindings.add(mirror);
        if (name) {
            this.addState("forward", name, mirror);
        }

        return mirror;
    }

    /**
     * Creates a pointer
     * @param value {*} default value to point
     * @param name {string} used for debugging internal state
     */
    public own<T>(value: IValue<T>, name?: string): Pointer<T> {
        const pointer = new OwningPointer(value);

        this.bindings.add(pointer);
        /* istanbul ignore else */
        if (name) {
            this.addState("own", name, pointer);
        }

        return pointer;
    }

    /**
     * Register a model/dependency
     */
    public register<T extends Destroyable>(data: T, name?: string): T {
        this.bindings.add(data);
        if (name) {
            this.addState("model", name, data);
        }

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
    public watch<Args extends unknown[]>(func: (...args: Args) => void, values: KindOfIValue<Args>) {
        this.bindings.add(new Expression<void, Args>(func, values));
    }

    /**
     * Creates a computed value
     * @param func {function} function to run on any argument change
     * @param values
     * @param name {string} used for debugging internal state
     * @return {IValue} the created ivalue
     */
    public expr<T, Args extends unknown[]>(
        func: (...args: Args) => T,
        values: KindOfIValue<Args>,
        name?: string,
    ): IValue<T> {
        const res: IValue<T> = new Expression<T, Args>(func, values);

        this.bindings.add(res);
        if (name) {
            this.addState("expr", name, res);
        }

        return res;
    }

    public runOnDestroy(func: () => void) {
        if (this.onDestroy) {
            console.warn(new Error("You rewrite onDestroy existing handler"));
            console.log(this.onDestroy);
        }
        this.onDestroy = func;
    }

    public addState(method: string, name: string, state: unknown) {
        this.state[name === "#" ? `#${Object.keys(this.state).length}` : name] = [method, state];
    }

    public destroy() {
        super.destroy();

        this.bindings.forEach(binding => binding.destroy());
        this.bindings.clear();

        this.onDestroy?.();
    }
}
