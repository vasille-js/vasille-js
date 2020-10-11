// @flow
import type {Callable, Instantiable} from "./interfaces/idefinition";
import type {IValue} from "./interfaces/ivalue";
import {Data} from "./data";
import {Property} from "./property";
import {Core} from "./interfaces/core";
import {AttributeBinding, Attribute} from "./attribute";
import {JitValue, Value} from "./value";
import {StyleBinding, Style} from "./style";
import {Event} from "./event";



export class Node implements Instantiable {
    parent   : Node;
    children : Array<{| node : Node, slot : ?string |}>;
    next     : ?Node;
    prev     : ?Node;
    $ref     : string;
    $refArr  : boolean;

    // Instantiable interface realization
    lastInstance : Core;

    create (rt : Core, ts : Core) : Core {
        throw "never be called";
    }

    ref (reference : string, likeArray : boolean = false) {
        this.$ref    = reference;
        this.$refArr = likeArray;
    }
}

export class TextNode extends Node {
    #value : IValue;

    constructor (text : IValue | String) {
        super();

        if (text instanceof String) {
            this.#value = new Value(text);
        }
        else {
            this.#value = text;
        }
    }

    create(rt: Core, ts: Core) : Core {
        let value : IValue;

        if (this.#value instanceof JitValue) {
            value = this.#value.create(rt, ts);
        }
        else {
            value = this.#value;
        }

        let node = document.createTextNode(value.get());

        value.on(function (v : IValue) {
            node.replaceData(0, -1, v.get());
        }.bind(null, value));

        this.lastInstance = new Core(node, {}, {"$" : value}, {}, {});
        return this.lastInstance;
    }
}

/**
 * Represents an Vasille.js component template
 * each template must have an id
 */
export class ElementNode extends Node {
    #tagName  : string;
    #building : boolean;

    $props : { [key : string] : Property };
    $data  : { [key : string] : Data };
    $attrs : { [key : string] : Attribute | AttributeBinding };
    $style : { [key : string] : Style | StyleBinding };
    $event : { [key : string] : Event };

    constructor(tagName : string) {
        super();
        this.#tagName  = tagName;
        this.#building = true;

        this.createProps();
        this.createData();
        this.createAttrs();
        this.createStyle();
        this.createBinds();
        this.createEvents();
        this.createDom();
        this.#building = false;
    }

    createProps  () { /* to be overloaded */ }
    createData   () { /* to be overloaded */ }
    createAttrs  () { /* to be overloaded */ }
    createStyle  () { /* to be overloaded */ }
    createBinds  () { /* to be overloaded */ }
    createEvents () { /* to be overloaded */ }
    createDom    () { /* to be overloaded */ }

    defProp (name : string, _type : Function, ...init : Array<any>) : ElementNode {
        this.$props[name] = new Property(name, _type, ...init);
        return this;
    }

    defProps (props : { [key: string] : Function }) : ElementNode {
        for (let i in props) {
            if (props.hasOwnProperty(i)) {
                this.$props[i] = new Property(i, props[i]);
            }
        }
        return this;
    }

    defData (
        nameOrSet : string | { [key : string] : any },
        funcOrAny : ?Callable | ?any = null
    ) : ElementNode {
        if (nameOrSet instanceof String && funcOrAny instanceof Function) {
            this.$data[nameOrSet] = new Data(nameOrSet, null, funcOrAny);
            return this;
        }

        if (nameOrSet instanceof String) {
            this.$data[nameOrSet] = new Data(nameOrSet, funcOrAny);
            return this;
        }

        if (nameOrSet instanceof Object && funcOrAny == null) {
            for (let i in nameOrSet) {
                if (nameOrSet.hasOwnProperty(i)) {
                    this.$data[i] = new Data(i, nameOrSet[i]);
                }
            }
            return this;
        }

        throw "Wrong function call";
    }

    defAttr (name : string, value : string | JitValue | Callable) : ElementNode {
        if (value instanceof Function) {
            this.$attrs[name] = new Attribute(name, null, value);
        }
        else {
            this.$attrs[name] = new Attribute(name, value);
        }
        return this;
    }

    defAttrs (obj : { [key : string] : string | JitValue }) : ElementNode {
        for (let i in obj) {
            this.$attrs[i] = new Attribute(i, obj[i]);
        }
        return this;
    }

    bindAttr (name : string, calculator : Function, ...values : Array<JitValue>) : ElementNode {
        this.$attrs[name] = new AttributeBinding(name, calculator, ...values);
        return this;
    }

    defStyle (name : string, value : string | JitValue | Callable) : ElementNode {
        if (value instanceof Function) {
            this.$style[name] = new Style(name, null, value);
        }
        else {
            this.$style[name] = new Style(name, value);
        }
        return this;
    }

    defStyles (obj : { [key : string] : string | JitValue }) : ElementNode {
        for (let i in obj) {
            this.$style[i] = new Style(i, obj[i]);
        }
        return this;
    }

    bindStyle (name : string, calculator : Function, ...values : Array<JitValue>) : ElementNode {
        this.$style[name] = new StyleBinding(name, calculator, ...values);
        return this;
    }

    defEvent (name : string, event : Function) : ElementNode {
        this.$event[name] = new Event(name, event);
        return this;
    }

    pushNode (node : Node, slot : ?string) {
        if (!this.#building && !slot) {
            slot = "default";
        }

        let last : ?Node = null;

        if (this.children.length) {
            last = this.children[this.children.length - 1].node;
        }

        if (last) {
            last.next = node;
        }
        node.prev   = last;
        node.parent = this;

        this.children.push({ node, slot });
    }

    defText (text : string, callback : ?(text : TextNode) => void) : ElementNode {
        let node = new TextNode(new String(text));
        this.pushNode(node, null);
        if (callback) {
            callback(node);
        }
        return this;
    }

    bindText (text : IValue, callback : ?(text : TextNode) => void) : ElementNode {
        let node = new TextNode(text);
        this.pushNode(node, null);
        if (callback) {
            callback(node);
        }
        return this;
    }

    defChild (tagName : string, callback : ?(node : ElementNode) => void) : ElementNode {
        let node = new ElementNode(tagName);
        this.pushNode(node, null);
        if (callback) {
            callback(node);
        }
        return this;
    }

    defCustomChild (func : Function, callback : ?(node : ElementNode) => void) : ElementNode {
        let node = new func();
        this.pushNode(node, null);
        if (callback) {
            callback(node);
        }
        return this;
    }
}

/**
 * Represents an Vasille.js component
 */
export class Component extends Core {
}
