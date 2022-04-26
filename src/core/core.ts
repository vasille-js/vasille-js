import { Destroyable } from "./destroyable.js";
import { wrongBinding } from "./errors";
import { IValue, Switchable } from "./ivalue.js";
import { Expression, KindOfIValue } from "../value/expression";
import { Reference } from "../value/reference";
import { Pointer } from "../value/pointer";
import { Mirror } from "../value/mirror";
import { IModel } from "../models/model";
import { Options } from "../functional/options";



export let current : Reactive | null = null;
const currentStack : (Reactive | null)[] = [];

function stack(node : Reactive) {
    currentStack.push(current);
    current = node;
}

function unstack() {
    current = currentStack.pop();
}

/**
 * Private stuff of a reactive object
 * @class ReactivePrivate
 * @extends Destroyable
 */
export class ReactivePrivate extends Destroyable {
    /**
     * A list of user-defined values
     * @type {Set}
     */
    public watch : Set<Switchable> = new Set;

    /**
     * A list of user-defined bindings
     * @type {Set}
     */
    public bindings : Set<Destroyable> = new Set;

    /**
     * A list of user defined models
     */
    public models : Set<IModel> = new Set;

    /**
     * Reactivity switch state
     * @type {boolean}
     */
    public enabled = true;

    /**
     * The frozen state of object
     * @type {boolean}
     */
    public frozen = false;

    /**
     * An expression which will freeze/unfreeze the object
     * @type {IValue<void>}
     */
    public freezeExpr : Expression<void, [boolean]>;

    /**
     * Parent node
     * @type {Reactive}
     */
    public parent : Reactive;

    public onDestroy ?: () => void;

    constructor () {
        super ();
        this.seal ();
    }

    destroy () {
        this.watch.forEach(value => value.destroy());
        this.watch.clear ();

        this.bindings.forEach(binding => binding.destroy());
        this.bindings.clear();

        this.models.forEach(model => model.disableReactivity());
        this.models.clear();

        this.freezeExpr && this.freezeExpr.destroy();
        this.onDestroy && this.onDestroy();
        super.destroy ();
    }
}

/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
export class Reactive<T extends Options = Options> extends Destroyable {
    /**
     * Private stuff
     * @protected
     */
    protected $ : ReactivePrivate;

    input !: T;

    public constructor (input : T, $ ?: ReactivePrivate) {
        super ();
        this.input = input;
        this.$ = $ || new ReactivePrivate;
        this.seal();
    }

    /**
     * Get parent node
     */
    get parent () : Reactive {
        return this.$.parent;
    }

    /**
     * Create a reference
     * @param value {*} value to reference
     */
    public ref<T> (value : T) : IValue<T> {
        const $ : ReactivePrivate = this.$;
        const ref = new Reference (value);
        $.watch.add (ref);
        return ref;
    }

    /**
     * Create a mirror
     * @param value {IValue} value to mirror
     */
    public mirror<T> (value : IValue<T>) : Mirror<T> {
        const mirror = new Mirror(value, false);

        this.$.watch.add(mirror);
        return mirror;
    }

    /**
     * Create a forward-only mirror
     * @param value {IValue} value to mirror
     */
    public forward<T> (value : IValue<T>) : Mirror<T> {
        const mirror = new Mirror(value, true);

        this.$.watch.add(mirror);
        return mirror;
    }

    /**
     * Creates a pointer
     * @param value {*} default value to point
     * @param forwardOnly {boolean} forward only sync
     */
    public point<T> (value : IValue<T>, forwardOnly = false) : Pointer<T> {
        const $ : ReactivePrivate = this.$;
        const pointer = new Pointer (value, forwardOnly);

        $.watch.add (pointer);
        return pointer;
    }

    /**
     * Register a model
     * @param model
     */
    public register<T extends IModel>(model : T) : T {
        this.$.models.add(model);
        return model;
    }

    public autodestroy(data : Destroyable) {
        this.$.bindings.add(data);
    }

    /**
     * Creates a watcher
     * @param func {function} function to run on any argument change
     * @param values
     */
    public watch<Args extends unknown[]> (
        func : (...args : Args) => void,
        ...values : KindOfIValue<Args>
    ) {
        const $ : ReactivePrivate = this.$;
        $.watch.add (new Expression (func, !this.$.frozen, ...values));
    }

    /**
     * Creates a computed value
     * @param func {function} function to run on any argument change
     * @param values
     * @return {IValue} the created ivalue
     */
    public expr<T, Args extends unknown[]> (
        func : (...args: Args) => T,
        ...values : KindOfIValue<Args>
    ) : IValue<T> {
        const res : IValue<T> = new Expression (func, !this.$.frozen, ...values);
        const $ : ReactivePrivate = this.$;

        $.watch.add (res);
        return res;
    }

    /**
     * Enable reactivity of fields
     */
    public enable () {
        const $ : ReactivePrivate = this.$;

        if (!$.enabled) {
            $.watch.forEach(watcher => {
                watcher.enable();
            });
            $.models.forEach(model => {
                model.enableReactivity();
            });
            $.enabled = true;
        }
    }

    /**
     * Disable reactivity of fields
     */
    public disable () {
        const $ : ReactivePrivate = this.$;

        if ($.enabled) {
            $.watch.forEach(watcher => {
                watcher.disable();
            });
            $.models.forEach(model => {
                model.disableReactivity();
            });
            $.enabled = false;
        }
    }

    /**
     * Disable/Enable reactivity of object fields with feedback
     * @param cond {IValue} show condition
     * @param onOff {function} on show feedback
     * @param onOn {function} on hide feedback
     */
    public bindAlive (cond : IValue<boolean>, onOff ?: () => void, onOn ?: () => void) : this {
        const $ : ReactivePrivate = this.$;

        if ($.freezeExpr) {
            throw wrongBinding("this component already have a freeze state");
        }

        if ($.watch.has (cond)) {
            throw wrongBinding ("freeze state must be bound to an external component");
        }

        $.freezeExpr = new Expression ((cond) => {
            $.frozen = !cond;

            if (cond) {
                onOn?. ();
                this.enable();
            } else {
                onOff?. ();
                this.disable();
            }
        }, true, cond);

        return this;
    }

    public init() {
        this.applyOptions(this.input);
        this.compose(this.input);
    }

    protected applyOptions(input : T) {
        // empty
    }

    protected compose (input : T) {
        // empty
    }

    public runFunctional<F extends (...args : any) => any>(f : F, ...args : Parameters<F>) : ReturnType<F> {
        stack(this);
        // yet another ts bug
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const result = f(...args);
        unstack();

        return result;
    }

    public runOnDestroy(func : () => void) {
        this.$.onDestroy = func;
    }

    public destroy () {
        super.destroy ();
        this.$.destroy ();
        this.$ = null;

    }
}
