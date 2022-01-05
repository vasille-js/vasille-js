import { Destroyable } from "./destroyable.js";
import { wrongBinding } from "./errors";
import { IValue } from "./ivalue.js";
import { Expression } from "../value/expression";
import { Reference } from "../value/reference";
import { Pointer } from "../value/pointer";
import { Mirror } from "../value/mirror";
import {IModel} from "../models/model";



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
    public watch : Set<IValue<unknown>> = new Set;

    /**
     * A list of user-defined bindings
     * @type {Set}
     */
    public bindings : Set<Destroyable> = new Set;

    /**
     * A list of user defined models
     */
    public models : Set<IModel<any, any>> = new Set;

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
    public freezeExpr : Expression<void, boolean>;

    constructor () {
        super ();
        this.$seal ();
    }

    $destroy () {
        this.watch.forEach(value => value.$destroy());
        this.watch.clear ();

        this.bindings.forEach(binding => binding.$destroy());
        this.bindings.clear();

        this.freezeExpr?.$destroy();
        super.$destroy ();
    }
}

/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
export class Reactive extends Destroyable {
    /**
     * Private stuff
     * @protected
     */
    protected $ : ReactivePrivate;

    public constructor ($ ?: ReactivePrivate) {
        super ();
        this.$ = $ || new ReactivePrivate;
    }

    /**
     * Create a reference
     * @param value {*} value to reference
     */
    public $ref<T> (value : T) : IValue<T> {
        const $ : ReactivePrivate = this.$;
        const ref = new Reference (value);
        $.watch.add (ref);
        return ref;
    }

    /**
     * Create a mirror
     * @param value {IValue} value to mirror
     * @param forwardOnly {boolean} forward only sync
     */
    public $mirror<T> (value : IValue<T>, forwardOnly = false) : Mirror<T> {
        const mirror = new Mirror(value, forwardOnly);

        this.$.watch.add(mirror);
        return mirror;
    }

    /**
     * Creates a pointer
     * @param value {*} default value to point
     * @param forwardOnly {boolean} forward only sync
     */
    public $point<T> (value : T | IValue<T>, forwardOnly = false) : Pointer<T> {
        const $ : ReactivePrivate = this.$;
        const ref = value instanceof IValue ? value : new Reference<T> (value);
        const pointer = new Pointer (ref, forwardOnly);

        // when value is an ivalue will be equal to ref
        if (value !== ref) {
            $.watch.add (ref);
        }
        $.watch.add (pointer);

        return pointer;
    }

    /**
     * Register a model
     * @param model
     */
    public $register<T extends IModel<any, any>>(model : T) : T {
        this.$.models.add(model);
        return model;
    }

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
    public $watch<T1> (
        func : (a1 : T1) => void,
        v1 : IValue<T1>, v2 ?: IValue<void>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $watch<T1, T2> (
        func : (a1 : T1, a2 : T2) => void,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $watch<T1, T2, T3> (
        func : (a1 : T1, a2 : T2, a3 : T3) => void,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $watch<T1, T2, T3, T4> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => void,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $watch<T1, T2, T3, T4, T5> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => void,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $watch<T1, T2, T3, T4, T5, T6> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => void,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $watch<T1, T2, T3, T4, T5, T6, T7> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => void,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $watch<T1, T2, T3, T4, T5, T6, T7 , T8> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => void,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 ?: IValue<void>,
    )
    public $watch<T1, T2, T3, T4, T5, T6, T7 , T8, T9> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    )
    public $watch<T1, T2, T3, T4, T5, T6, T7 , T8, T9> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) {
        const $ : ReactivePrivate = this.$;
        $.watch.add (new Expression (func, !this.$.frozen, v1, v2, v3, v4, v5, v6, v7, v8, v9));
    }

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
    public $bind<T, T1> (
        func : (a1 : T1) => T,
        v1 : IValue<T1>, v2 ?: IValue<void>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $bind<T, T1, T2> (
        func : (a1 : T1, a2 : T2) => T,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $bind<T, T1, T2, T3> (
        func : (a1 : T1, a2 : T2, a3 : T3) => T,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $bind<T, T1, T2, T3, T4> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => T,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $bind<T, T1, T2, T3, T4, T5> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => T,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $bind<T, T1, T2, T3, T4, T5, T6> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => T,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $bind<T, T1, T2, T3, T4, T5, T6, T7> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => T,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    )
    public $bind<T, T1, T2, T3, T4, T5, T6, T7 , T8> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => T,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 ?: IValue<void>,
    )
    public $bind<T, T1, T2, T3, T4, T5, T6, T7 , T8, T9> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => T,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    )
    public $bind<T, T1, T2, T3, T4, T5, T6, T7 , T8, T9> (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => T,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) : IValue<T> {
        const res : IValue<T> = new Expression (func, !this.$.frozen, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        const $ : ReactivePrivate = this.$;

        $.watch.add (res);
        return res;
    }

    /**
     * Enable reactivity of fields
     */
    public $enable () {
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
    public $disable () {
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
    public $bindAlive (cond : IValue<boolean>, onOff ?: () => void, onOn ?: () => void) : this {
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
                this.$enable();
            } else {
                onOff?. ();
                this.$disable();
            }
        }, true, cond);

        return this;
    }

    public $destroy () {
        super.$destroy ();
        this.$.$destroy ();
        this.$ = null;

    }
}
