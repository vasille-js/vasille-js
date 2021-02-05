// @flow
import type { AppNode, BaseNode }  from "../node";
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
     * @type {BaseNode}
     */
    root : BaseNode;

    /**
     * The this node
     * @type {BaseNode}
     */
    ts : BaseNode;

    /**
     * The app node
     * @type {VasilleNode}
     */
    app : AppNode;

    /**
     * A link to a parent node
     * @type {VasilleNode}
     */
    parent : BaseNode;

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
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {?VasilleNode} VasilleNode to paste this after
     */
    preinit (app : AppNode, rt : BaseNode, ts : BaseNode, before : ?VasilleNode) {
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
     * @type {Object<String, IValue>}
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
        this.$el = null;
        this.$attrs = null;
        this.$style = null;
        this.root = null;
        this.ts = null;
        this.app = null;
        this.parent = null;
        this.next = null;
        this.prev = null;
    }
}

/**
 * This class is symbolic
 */
export class VasilleNode extends Destroyable {
    $ : any;

    constructor ($ : ?VasilleNodePrivate) {
        super();
        this.$ = $ || new VasilleNodePrivate;
    }
}
