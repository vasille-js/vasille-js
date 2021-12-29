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
    $ : any;

    constructor ($ : ?ReactivePrivate) {
        super ();
        this.$ = $ || new ReactivePrivate;
    }

    /**
     * create a private field
     */
    $ref<T> (value : T) : IValue<T> {
        let $ : ReactivePrivate = this.$;
        let ref = new Reference (value);
        $.watch.add (ref);
        return ref;
    }

    /**
     * creates a pointer
     */
    $pointer<T> (value : T) : Pointer<T> {
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
    $watch<
        T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void, T7 = void, T8 = void, T9 = void
    > (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => void,
        v1: IValue<T1>,
        v2?: IValue<T2>,
        v3?: IValue<T3>,
        v4?: IValue<T4>,
        v5?: IValue<T5>,
        v6?: IValue<T6>,
        v7?: IValue<T7>,
        v8?: IValue<T8>,
        v9?: IValue<T9>,
    ) {
        let $ : ReactivePrivate = this.$;
        $.watch.add (new Expression (func, !this.$.frozen, v1, v2, v3, v4, v5, v6, v7, v8, v9));
    }

    /**
     * Creates a bind expression
     */
    $bind<
        T, T1 = void, T2 = void, T3 = void, T4 = void, T5 = void, T6 = void, T7 = void, T8 = void, T9 = void
    > (
        func : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => T,
        v1: IValue<T1>,
        v2?: IValue<T2>,
        v3?: IValue<T3>,
        v4?: IValue<T4>,
        v5?: IValue<T5>,
        v6?: IValue<T6>,
        v7?: IValue<T7>,
        v8?: IValue<T8>,
        v9?: IValue<T9>,
    ) : IValue<T> {
        let res : IValue<T> = new Expression (func, !this.$.frozen, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        let $ : ReactivePrivate = this.$;

        $.watch.add (res);
        return res;
    }

    $enable () {
        let $ : ReactivePrivate = this.$;

        if (!$.enabled) {
            for (let watcher of $.watch) {
                watcher.enable();
            }
            $.enabled = true;
        }
    }

    $disable () {
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
    $bindFreeze (cond : IValue<boolean>, onOff : ?Function, onOn : ?Function) : this {
        let $ : ReactivePrivate = this.$;

        if ($.freezeExpr) {
            throw wrongBinding("this component already have a freeze state");
        }

        if ($.watch.has (cond)) {
            throw wrongBinding ("freeze state must be bound to an external component");
        }

        $.freezeExpr = new Expression<void, boolean> ((cond) => {
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

    $destroy () {
        this.$.$destroy ();
        // $FlowFixMe
        this.$ = null;

        super.$destroy ();
    }
}
