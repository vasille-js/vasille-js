// @flow
import { Destroyable } from "./destroyable.js";
import {  wrongBinding } from "./errors";
import { IValue } from "./ivalue.js";
import { Expression } from "../value/expression";
import { Reference } from "../value/reference";
import { Pointer } from "../value/pointer";



/**
 * This is private stuff of a reactive object
 * @extends Destroyable
 */
export class ReactivePrivate extends Destroyable {
    /**
     * Represents a list of user-defined values
     * @type {Set<IValue>}
     */
    watch : Set<IValue<any>> = new Set;

    /**
     * Represents a list of user-defined bindings
     * @type {Set<IValue>}
     */
    bindings : Set<Destroyable> = new Set;

    /**
     * Reactivity switch state
     * @type {boolean}
     */
    enabled : boolean = true;

    /**
     * Defined the frozen state of component
     * @type {boolean}
     */
    frozen : boolean = false;

    /**
     * Contains an expression which will freeze/unfreeze the object
     * @type {IValue<void>}
     */
    freezeExpr : Expression<void, boolean>;

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
 * This is a reactive object
 * @extends Destroyable
 */
export class Reactive extends Destroyable {
    protected $ : ReactivePrivate;

    public constructor ($ ?: ReactivePrivate) {
        super ();
        this.$ = $ || new ReactivePrivate;
    }

    /**
     * create a private field
     */
    public $ref<T> (value : T) : IValue<T> {
        let $ : ReactivePrivate = this.$;
        let ref = new Reference (value);
        $.watch.add (ref);
        return ref;
    }

    /**
     * creates a pointer
     */
    public $pointer<T> (value : T) : Pointer<T> {
        let $ : ReactivePrivate = this.$;
        let ref = new Reference<T> (value);
        let pointer = new Pointer (ref);

        $.watch.add (ref);
        $.watch.add (pointer);

        return pointer;
    }

    /**
     * Defines a watcher
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
        let $ : ReactivePrivate = this.$;
        $.watch.add (new Expression (func, !this.$.frozen, v1, v2, v3, v4, v5, v6, v7, v8, v9));
    }

    /**
     * Creates a bind expression
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
        let res : IValue<T> = new Expression (func, !this.$.frozen, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        let $ : ReactivePrivate = this.$;

        $.watch.add (res);
        return res;
    }

    public $enable () {
        let $ : ReactivePrivate = this.$;

        if (!$.enabled) {
            for (let watcher of $.watch) {
                watcher.enable();
            }
            $.enabled = true;
        }
    }

    public $disable () {
        let $ : ReactivePrivate = this.$;

        if ($.enabled) {
            for (let watcher of $.watch) {
                watcher.disable();
            }
        }
    }

    /**
     * Disable/Enable reactivity of component with feedback
     * @param cond {IValue} show condition
     * @param onOff {Function} on show feedback
     * @param onOn {Function} on hide feedback
     */
    public $bindFreeze (cond : IValue<boolean>, onOff ?: Function, onOn ?: Function) : this {
        let $ : ReactivePrivate = this.$;

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
        this.$.$destroy ();
        // $FlowFixMe
        this.$ = null;

        super.$destroy ();
    }
}
