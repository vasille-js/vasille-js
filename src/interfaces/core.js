// @flow

import {Destroyable} from "./destroyable.js";
import {IValue}      from "./ivalue.js";



export type LiveFields = { [key : string] : IValue<any> };
export type CoreEl = HTMLElement | Text | Comment;


/**
 * Destroy all destroyable object fields
 * @param obj {Object<any, any>} Object to be iterated
 */
export function destroyObject (obj : Object) {
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            let prop = obj[i];
            if (prop instanceof Destroyable) {
                prop.destroy();
            }
        }
    }
}
/**
 * Represents an Vasille.js component core
 * @implements Destroyable
 */
export class Core extends Destroyable {
    /**
     * The encapsulated element
     * @type {HTMLElement | Text | Comment}
     * @see Core#coreEl
     * @see Core#el
     * @see Core#text
     * @see Core#comment
     */
    $el : CoreEl;

    /**
     * The collection of properties
     * @type {Object<String, IValue>}
     * @see Core#props
     */
    $props : LiveFields = {};

    /**
     * The collection of data
     * @type {Object<String, IValue>}
     * @see Core#data
     */
    $data  : LiveFields = {};

    /**
     * The collection of attributes
     * @type {Object<String, IValue>}
     * @see Core#attrs
     */
    $attrs : LiveFields = {};

    /**
     * The collection of style attributes
     * @type {Object<String, IValue>}
     * @see Core#style
     */
    $style : LiveFields = {};

    /**
     * Builds a component core by a html element/text/comment
     */
    constructor () {
        super();
    }

    /**
     * Encapsulate element
     * @param el {HTMLElement | Text | Comment} element to encapsulate
     */
    encapsulate (el : CoreEl) : this {
        this.$el = el;
        return this;
    }

    /**
     * Gets the encapsulated element anyway
     * @type {HTMLElement | Text | Comment}
     * @see Core#$el
     */
    get coreEl () : CoreEl {
        return this.$el;
    }

    /**
     * Gets the encapsulated element if it is a html element, otherwise undefined
     * @type {HTMLElement}
     * @see Core#$el
     */
    get el () : HTMLElement {
        let el = this.coreEl;
        if (el instanceof HTMLElement) {
            return el;
        }

        throw "wrong Core.el() call";
    }

    /**
     * Gets the encapsulated element if it is a html text node, otherwise undefined
     * @type {Text}
     * @see Core#$el
     */
    get text () : Text {
        let el = this.coreEl;
        if (el instanceof Text) {
            return el;
        }

        throw "wrong Core.text() call";
    }

    /**
     * Gets the encapsulated element if it is a html comment, otherwise undefined
     * @type {Comment}
     * @see Core#$el
     */
    get comment () : Comment {
        let el = this.coreEl;
        if (el instanceof Comment) {
            return el;
        }

        throw "wrong Core.comment() call";
    }

    /**
     * Gets the component properties
     * @type {Object<String, IValue>}
     * @see Core#$props
     */
    get props () : LiveFields {
        return this.$props;
    }

    /**
     * Gets the component data
     * @type {Object<String, IValue>}
     * @see Core#$data
     */
    get data () : LiveFields {
        return this.$data;
    }

    /**
     * Gets the component life attributes
     * @type {Object<String, IValue>}
     * @see Core#$attrs
     */
    get attrs () : LiveFields {
        return this.$attrs;
    }

    /**
     * Gets the component life style attributes
     * @type {Object<String, IValue>}
     * @see Core#$style
     */
    get style () : LiveFields {
        return this.$style;
    }

    /**
     * Unlinks all bindings
     */
    destroy () {
        destroyObject(this.$props);
        destroyObject(this.$data);
        destroyObject(this.$attrs);
        destroyObject(this.$style);
    }
}
