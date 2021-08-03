// @flow
import type { App, INode }         from "../node";
import { Destroyable }             from "./destroyable.js";
import { internalError, notFound } from "./errors";
import { IValue }                  from "./ivalue.js";



export type LiveFields = { [key : string] : IValue<any> };
export type CoreEl = HTMLElement | Text | Comment;


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
 * Represents a Vasille.js node
 * @implements Destroyable
 */
export class VasilleNodePrivate extends Destroyable {
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
        if (el instanceof HTMLElement) {
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
 */
export class VasilleNode extends Destroyable {
    /**
     * @type {VasilleNodePrivate}
     */
    $ : any;

    /**
     * Constructs a Vasille Node
     * @param $ {VasilleNodePrivate}
     */
    constructor ($ : ?VasilleNodePrivate) {
        super();
        this.$ = $ || new VasilleNodePrivate;
    }
}
