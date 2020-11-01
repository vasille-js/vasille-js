// @flow
import type {CoreEl}      from "./interfaces/core";
import type {Destroyable} from "./interfaces/destroyable";
import type {IValue}      from "./interfaces/ivalue";
import type {ValueType}   from "./interfaces/types";

import {AttributeBinding, attributify} from "./attribute";
import {Bind1, BindN}                  from "./bind";
import {Callable}                      from "./interfaces/idefinition";
import {Core}                          from "./interfaces/core";
import {datify}                        from "./data";
import {eventify}                      from "./event";
import {Property, propertify}          from "./property";
import {Rebind, Value}                 from "./value";
import {StyleBinding, stylify}         from "./style";



export interface INode {
    appendChild (node : CoreEl) : void;
}

export class Node extends Core {
    parent : Node;
    next   : ?Node;
    prev   : ?Node;
    $rt    : BaseNode;

    constructor (
        root: ?BaseNode,
        el: CoreEl | null
    ) {
        if (el && root) {
            super(el);
            this.$rt = root;
        }
    }

    ref (
        reference: string,
        likeArray: boolean = false
    ) : void {
        let ref = this.$rt.refs[reference];

        if (likeArray) {
            if (ref instanceof Array) {
                ref.push(this);
            } else {
                this.$rt.refs[reference] = [this];
            }
        } else {
            this.$rt.refs[reference] = this;
        }
    }

    destroy () : void {
        super.destroy();
        for (let i in this.$rt.refs) {
            if (this.$rt.refs[i] === this) {
                delete this.$rt.refs[i];
            }
        }
    }
}

export class TextNode extends Node implements Destroyable {
    #value   : IValue;
    #handler : Function;

    constructor(
        rt   : BaseNode,
        ts   : BaseNode,
        text : IValue | string
    ) {
        let value = text instanceof Value  ||
                    text instanceof Rebind ||
                    text instanceof Bind1  ||
                    text instanceof BindN  ? text : new Value(text);
        let node  = document.createTextNode(value.get());

        super(rt, node);

        this.#value   = value;
        this.#handler = function (v: IValue) {
            node.replaceData(0, -1, v.get());
        }.bind(null, value);

        value.on(this.#handler);

        ts.appendChild(node);
    }

    get value() : IValue {
        return this.#value;
    }

    destroy () : void {
        super.destroy();
        this.#value.off(this.#handler);
    }
}

type TextNodeCB    = ?(text : TextNode) => void;
type ElementNodeCB = ?(text : ElementNode) => void;

/**
 * Represents an Vasille.js component template
 * each template must have an id
 */
export class BaseNode extends Node implements INode {
    children   : Array<Node> = [];
    #building  : boolean;
    $event     : { [key : string] : IValue }             = {};
    refs       : { [key : string] : Node | Array<Node> } = {};
    slots      : { [key : string] : BaseNode }           = {};
    $propsDefs : { [key : string] : Property }           = {};

    constructor(
        rt    : ?BaseNode,
        ts    : ?BaseNode,
        node  : ?CoreEl,
        props : Object
    ) {
        if (rt && ts && ts.el && node) {
            ts.appendChild(node);
            super(rt, node);
        }
        else {
            super(null, null);
            if (node) {
                this.$el = node;
            }
        }
        this.#building = true;

        this.createProps();
        this.initProps(props);
        this.createData();
        this.createAttrs();
        this.createStyle();
        this.createBinds();
        this.createEvents();

        this.created();
        this.createDom();

        this.#building = false;
        this.mounted();
    }

    destroy () : void {
        super.destroy();

        for (let child of this.children) {
            child.destroy();
        }
    }

    get rt () : BaseNode {
        return this.#building ? this : this.$rt;
    }

    created() { /* to be overloaded */ }
    mounted() { /* to be overloaded */ }

    createProps  () { /* to be overloaded */ }
    createData   () { /* to be overloaded */ }
    createAttrs  () { /* to be overloaded */ }
    createStyle  () { /* to be overloaded */ }
    createBinds  () { /* to be overloaded */ }
    createEvents () { /* to be overloaded */ }
    createDom    () { /* to be overloaded */ }

    defProp (
        name    : string,
        _type   : Function,
        ...init : Array<any>
    ) : BaseNode {
        this.$propsDefs[name] = new Property(_type, ...init);
        return this;
    }

    defProps (props : { [key: string]: Function }): BaseNode {
        for (let i in props) {
            if (props.hasOwnProperty(i)) {
                this.$propsDefs[i] = new Property(props[i]);
            }
        }
        return this;
    }

    initProps (props : { [key: string]: Callable | IValue | any }) {
        // add properties from object
        for (let i in props) {
            if (props.hasOwnProperty(i)) {
                let value = props[i];
                let propertyValue;

                if (value instanceof Callable) {
                    propertyValue = propertify(this.rt, this, null, value);
                } else {
                    propertyValue = propertify(this.rt, this, value);
                }

                if (!this.$propsDefs[i]) {
                    throw "No such property: " + i;
                }
                if (!(propertyValue.get() instanceof this.$propsDefs[i].type)) {
                    throw "Wrong value type of property: " + i;
                }

                this.$props[i] = propertyValue;
            }
        }

        for (let i in this.$propsDefs) {
            if (!this.$props[i]) {
                this.$props[i] = this.$propsDefs[i].createDefaultValue();
            }
        }
    }

    defData (
        nameOrSet : string | { [key: string] : any },
        funcOrAny : ?Callable | ?any = null
    ) : BaseNode {
        if (nameOrSet instanceof String && funcOrAny instanceof Callable) {
            this.$data[nameOrSet] = datify(this.rt, this, null, funcOrAny);
            return this;
        }

        if (nameOrSet instanceof String) {
            this.$data[nameOrSet] = datify(this.rt, this, funcOrAny);
            return this;
        }

        if (nameOrSet instanceof Object && funcOrAny == null) {
            for (let i in nameOrSet) {
                if (nameOrSet.hasOwnProperty(i)) {
                    this.$data[i] = datify(this.rt, this, nameOrSet[i]);
                }
            }
            return this;
        }

        throw "Wrong function call";
    }

    defAttr (
        name  : string,
        value : string | ValueType | Callable
    ) : BaseNode {
        if (!this.el) {
            throw "Just elements accepts attributes";
        }

        if (value instanceof Callable) {
            this.$attrs[name] = attributify(this.rt, this, name, null, value);
        } else {
            this.$attrs[name] = attributify(this.rt, this, name, value);
        }
        return this;
    }

    defAttrs (obj : { [key: string] : string | IValue }) : BaseNode {
        if (!this.el) {
            throw "Just elements accepts attributes";
        }

        for (let i in obj) {
            this.$attrs[i] = attributify(this.rt, this, i, obj[i]);
        }
        return this;
    }

    bindAttr (
        name       : string,
        calculator : Function,
        ...values  : Array<IValue>
    ) : BaseNode {
        if (!this.el) {
            throw "Just elements accepts attributes";
        }

        this.$attrs[name] = new AttributeBinding(this.rt, this, name, calculator, ...values);
        return this;
    }

    defStyle (
        name  : string,
        value : string | IValue | Callable
    ) : BaseNode {
        if (!this.el) {
            throw "Just elements accepts style attributes";
        }

        if (value instanceof Callable) {
            this.$style[name] = stylify(this.rt, this, name, null, value);
        } else {
            this.$style[name] = stylify(this.rt, this, name, value);
        }
        return this;
    }

    defStyles (obj : { [key: string]: string | IValue }) : BaseNode {
        if (!this.el) {
            throw "Just elements accepts style attributes";
        }

        for (let i in obj) {
            this.$style[i] = stylify(this.rt, this, i, obj[i]);
        }
        return this;
    }

    bindStyle (
        name       : string,
        calculator : Function,
        ...values  : Array<IValue>
    ) : BaseNode {
        if (!this.el) {
            throw "Just elements accepts style attributes";
        }

        this.$style[name] = new StyleBinding(this.rt, this, name, calculator, ...values);
        return this;
    }

    defEvent (
        name  : string,
        event : Function
    ) : BaseNode {
        this.$event[name] = eventify(this.rt, this, name, event);
        return this;
    }

    slot (name : string) {
        this.$rt.slots[name] = this;
    }

    #lastChild : ?Node = null;

    pushNodeNow (node : Node) : void {
        if (this.#lastChild) {
            this.#lastChild.next = node;
        }
        node.prev = this.#lastChild;
        node.parent = this;

        this.children.push(node);
        this.#lastChild = node;
    }

    pushNode (
        node     : Node,
        slotName : ?string
    ) : void {
        if (this.#building) {
            this.pushNodeNow(node);
        }
        else {
            let slot = slotName ? this.slots[slotName] : this.slots['default'];

            if (!slot) {
                throw "No such slot: " + (slotName || 'default');
            }

            slot.pushNodeNow(node);
        }
    }

    appendChild (node : CoreEl) : void {
        if (!this.el) {
            throw "This node doesn't accept children";
        }

        this.el.appendChild(node);
    }

    defText (
        text     : string | IValue,
        cbOrSlot : string | TextNodeCB,
        cb2      : TextNodeCB
    ) : BaseNode {
        let node = new TextNode(this.rt, this, text);

        this.pushNode(node, cbOrSlot instanceof String ? cbOrSlot : null);

        if (cbOrSlot instanceof Function) {
            cbOrSlot(node);
        }
        else if (cb2) {
            cb2(node);
        }
        return this;
    }

    defTag (
        tagName  : string,
        cbOrSlot : string | ElementNodeCB,
        cb2      : ElementNodeCB
    ) : BaseNode {
        let node = new ElementNode(this.rt, this, tagName, {});

        this.pushNode(node, cbOrSlot instanceof String ? cbOrSlot : null);

        if (cbOrSlot instanceof Function) {
            cbOrSlot(node);
        }
        else if (cb2) {
            cb2(node);
        }
        return this;
    }

    defElement (
        func     : Function,
        props    : Object,
        cbOrSlot : string | ElementNodeCB,
        cb2      : ElementNodeCB
    ) : BaseNode {
        let node = new func(this.rt, this, props);

        this.pushNode(node, cbOrSlot instanceof String ? cbOrSlot : null);

        if (cbOrSlot instanceof Function) {
            cbOrSlot(node);
        }
        else if (cb2) {
            cb2(node);
        }
        return this;
    }
}

/**
 * Represents an Vasille.js component template
 * each template must have an id
 */
export class ElementNode extends BaseNode {
    #node: HTMLElement;

    constructor(
        rt      : ?BaseNode,
        ts      : ?BaseNode,
        tagName : string,
        props   : Object
    ) {
        let node = document.createElement(tagName);
        super(rt, ts, node, props);
        this.#node = node;
    }

    get el() : HTMLElement {
        return this.#node;
    }
}

export class ShadowNode extends BaseNode {
    $shadow : ?Comment;

    constructor(
        rt    : ?BaseNode,
        ts    : ?BaseNode,
        cName : string,
        props : Object
    ) {
        let shadow = document.createComment(cName);
        super(rt, ts, shadow, props);
        this.$shadow = shadow;
    }

    get coreEl () : ?CoreEl {
        if (this.children.length) {
            return this.children[this.children.length - 1].coreEl;
        }
        return this.$shadow;
    }
 }
