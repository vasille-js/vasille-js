// @flow
import type { App, INode }                                  from "../node";
import { Destroyable }                                      from "./destroyable.js";
import { internalError, notFound, typeError, wrongBinding } from "./errors";
import { IValue }                                           from "./ivalue.js";
import { vassilify }                                        from "../models";
import { Pointer, Reference }                               from "../value";
import { checkType }                                        from "./idefinition";
import { Expression }                                       from "../bind";
import { IBind }                                            from "./ibind";



export type LiveFields = { [key : string] : IValue<any> };
export type CoreEl = HTMLElement | Text | Comment;
export type Signal = {| args : Array<Function>, handlers : Array<Function> |};

/**
 * Destroy all destroyable object fields
 * @param obj {Object<any, any>} Object to be iterated
 */
export function $destroyObject (obj : Object) {
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            let prop = obj[i];
            if (prop instanceof Destroyable && !(prop instanceof VasilleNode)) {
                prop.$destroy();
            }
            delete obj[i];
        }
    }
}

/**
 * This is private stuff of a reactive object
 * @extends Destroyable
 */
export class ReactivePrivate extends Destroyable {
    /**
     * Represents a list of user-defined bindings
     * @type {Set<IValue>}
     */
    watch : Set<IValue<*>> = new Set;

    /**
     * List of user defined signals
     * @type {Map<string, {args : Array<Function>, handlers : Array<Function>}>}
     */
    signal : Map<string, Signal> = new Map;

    /**
     * Defined the frozen state of component
     * @type {boolean}
     */
    frozen : boolean = false;

    /**
     * Handle to run on component destroy
     * @type {Function}
     */
    onDestroy : Function;

    constructor () {
        super ();
        this.seal();
    }

    $destroy () {
        for (let w of this.watch) {
            w.$destroy();
        }
        this.watch.clear();
        this.signal.clear();

        //$FlowFixMe
        this.watch = null;
        //$FlowFixMe
        this.signal = null;

        if (this.onDestroy) {
            this.onDestroy();
        }

        super.$destroy();
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
     * @param value {*}
     * @return {IValue<*>}
     */
    $ref (value : any) : IValue<any> {
        let $ : ReactivePrivate = this.$;
        let ret = vassilify(value);
        $.watch.add(ret);
        return ret;
    }

    /**
     * creates a public field
     * @param type {Function}
     * @param value {*}
     * @return {Reference}
     */
    $prop (type : Function, value : any = null) : Reference<any> {
        if (!checkType(value, type) || value instanceof IValue) {
            throw typeError("wrong initial public field value");
        }

        let $ : ReactivePrivate = this.$;
        let ret = vassilify(value);
        if (ret instanceof Reference) {
            ret.type = type;
            $.watch.add(ret);
            return ret;
        }
        else {
            throw internalError("Something goes wrong :(");
        }
    }

    /**
     * creates a pointer
     * @param type {Function}
     * @return {Pointer}
     */
    $pointer (type : Function) : Pointer<any> {
        let $ : ReactivePrivate = this.$;
        let ref = new Reference<any>();
        let pointer = new Pointer(ref);

        ref.type = type;
        $.watch.add(ref);
        $.watch.add(pointer);

        return pointer;
    }

    /**
     * Add a handler for a signal
     * @param name {string} Signal name
     * @param func {Function} Handler
     */
    $on (name : string, func : Function) {
        let signal = this.$.signal.get(name);

        if (!signal) {
            throw notFound("no such signal: " + name);
        }

        signal.handlers.push(func);
    }

    /**
     * Defines a signal
     * @param name {string} Signal name
     * @param types {...Function} Arguments types
     */
    $defSignal (name : string, ...types : Array<Function>) {
        this.$.signal.set(name, { args : types, handlers : [] });
    }

    /**
     * Emit a signal
     * @param name {string} Signal name
     * @param args {...*} Signal arguments
     */
    $emit (name : string, ...args : Array<any>) {
        let signal = this.$.signal.get(name);

        if (!signal) {
            throw notFound("no such signal: " + name);
        }

        let compatible = args.length === signal.args.length;

        if (compatible && window.$debug) {
            for (let i = 0; i < args.length; i++) {
                if (!checkType(args[i], signal.args[i])) {
                    compatible = false;
                }
            }
        }

        if (!compatible) {
            throw typeError("incompatible signals arguments");
        }

        for (let handler of signal.handlers) {
            try {
                handler(...args);
            }
            catch (e) {
                console.error(`Vasille.js: Handler throw exception at ${this.constructor.name}::${name}: `, e);
            }
        }
    }

    /**
     * Defines a watcher
     * @param func {function} Function to run on value change
     * @param vars {...IValue} Values to listen
     */
    $watch (func : Function, ...vars : Array<IValue<any>>) {
        if (vars.length === 0) {
            throw wrongBinding("a watcher must be bound to a value at last");
        }

        this.$.watch.add(new Expression(func, vars, !this.$.frozen));
    }

    /**
     * Creates a bind expression
     * @param f {Function} function to alc expression value
     * @param args {...IValue} value sto bind
     * @return {IBind}
     */
    $bind (f : Function, ...args : Array<IValue<any>>) : IBind {
        let res : IBind;

        if (args.length === 0) {
            throw wrongBinding("no values to bind");
        }
        else {
            res = new Expression(f, args, !this.$.frozen);
        }

        this.$.watch.add(res);
        return res;
    }

    /**
     * Disable/Enable reactivity of component with feedback
     * @param cond {IValue} show condition
     * @param onOff {Function} on show feedback
     * @param onOn {Function} on hide feedback
     */
    $bindFreeze (cond : IValue<boolean>, onOff : ?Function, onOn : ?Function) : this {
        let $ : ReactivePrivate = this.$;

        if ($.watch.has(cond)) {
            throw wrongBinding(":show must be bound to an external component");
        }

        let expr = null;

        expr = new Expression((cond) => {
            $.frozen = !cond;

            if (cond) {
                onOn?.();
                for (let watcher of $.watch) {
                    if (watcher instanceof IBind) {
                        watcher.link();
                    }
                }
            }
            else {
                onOff?.();
                for (let watcher of $.watch) {
                    if (watcher instanceof IBind && watcher !== expr) {
                        watcher.unlink();
                    }
                }
            }
        }, [cond]);

        $.watch.add(expr);
        return this;
    }

    $destroy () {
        this.$.$destroy();
        // $FlowFixMe
        this.$ = null;

        super.$destroy ();
    }
}

/**
 * Represents a Vasille.js node
 * @extends ReactivePrivate
 */
export class VasilleNodePrivate extends ReactivePrivate {
    /**
     * The encapsulated element
     * @type {HTMLElement | Text | Comment}
     * @see VasilleNode#coreEl
     * @see VasilleNode#el
     * @see VasilleNode#text
     * @see VasilleNode#comment
     */
    $el : CoreEl;

    /**
     * The collection of attributes
     * @type {Object<String, IValue>}
     * @see VasilleNode#attr
     */
    $attrs : LiveFields = {};

    /**
     * The collection of style attributes
     * @type {Object<String, IValue>}
     * @see VasilleNode#style
     */
    $style : LiveFields = {};
    /**
     * The root node
     * @type {INode}
     */
    root : INode;

    /**
     * The this node
     * @type {INode}
     */
    ts : INode;

    /**
     * The app node
     * @type {VasilleNode}
     */
    app : App;

    /**
     * A link to a parent node
     * @type {VasilleNode}
     */
    parent : INode;

    /**
     * The next node
     * @type {?VasilleNode}
     */
    next : ?VasilleNode;

    /**
     * The previous node
     * @type {?VasilleNode}
     */
    prev : ?VasilleNode;

    constructor () {
        super();

        this.seal();
    }

    /**
     * Gets the encapsulated element anyway
     * @type {HTMLElement | Text | Comment}
     * @see VasilleNode#$el
     */
    get coreEl () : CoreEl {
        return this.$el;
    }

    /**
     * Gets the encapsulated element if it is a html element, otherwise undefined
     * @type {HTMLElement}
     * @see VasilleNode#$el
     */
    get el () : HTMLElement {
        let el = this.coreEl;
        if (el instanceof HTMLElement || el instanceof window.SVGElement) {
            return el;
        }

        throw internalError("wrong VasilleNode.$el() call");
    }

    /**
     * Gets the encapsulated element if it is a html text node, otherwise undefined
     * @type {Text}
     * @see VasilleNode#$el
     */
    get text () : Text {
        let el = this.coreEl;
        if (el instanceof Text) {
            return el;
        }

        throw internalError("wrong VasilleNode.$text() call");
    }

    /**
     * Gets the encapsulated element if it is a html comment, otherwise undefined
     * @type {Comment}
     * @see VasilleNode#$el
     */
    get comment () : Comment {
        let el = this.coreEl;
        if (el instanceof Comment) {
            return el;
        }

        throw internalError("wrong VasilleNode.$comment() call");
    }

    /**
     * Encapsulate element
     * @param el {HTMLElement | Text | Comment} element to encapsulate
     * @private
     */
    encapsulate (el : CoreEl) : this {
        this.$el = el;
        return this;
    }

    /**
     * Pre-initializes the base of a node
     * @param app {App} the app node
     * @param rt {INode} The root node
     * @param ts {INode} The this node
     * @param before {?VasilleNode} VasilleNode to paste this after
     */
    preinit (app : App, rt : INode, ts : INode, before : ?VasilleNode) {
        this.app = app;
        this.root = rt;
        this.ts = ts;
    }

    /**
     * Gets the component life attribute value
     * @param field {string} attribute name
     * @return {IValue}
     */
    attr (field : string) : IValue<string> {
        let v = this.$attrs[field];

        if (v instanceof IValue) {
            return v;
        }

        throw notFound("no such attribute: " + field);
    }

    /**
     * Gets the component life style attribute
     * @param field {Object<String, IValue>}
     * @return {IValue<string>}
     * @see VasilleNode#$style
     */
    style (field : string) : IValue<string> {
        let v = this.$style[field];

        if (v instanceof IValue) {
            return v;
        }

        throw notFound("no such style attribute: " + field);
    }

    /**
     * Unlinks all bindings
     */
    $destroy () {
        $destroyObject(this.$attrs);
        $destroyObject(this.$style);
        //$FlowFixMe
        this.$el = null;
        //$FlowFixMe
        this.$attrs = null;
        //$FlowFixMe
        this.$style = null;
        //$FlowFixMe
        this.root = null;
        //$FlowFixMe
        this.ts = null;
        //$FlowFixMe
        this.app = null;
        //$FlowFixMe
        this.parent = null;
        //$FlowFixMe
        this.next = null;
        //$FlowFixMe
        this.prev = null;
    }
}

/**
 * This class is symbolic
 * @extends Reactive
 */
export class VasilleNode extends Reactive {
    /**
     * Constructs a Vasille Node
     * @param $ {VasilleNodePrivate}
     */
    constructor ($ : ?VasilleNodePrivate) {
        super();
        this.$ = $ || new VasilleNodePrivate;
    }
}
