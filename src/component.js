// @flow
import type {Callable, Instantiable} from "./interfaces/idefinition";
import type {IValue} from "./interfaces/ivalue";
import {DataDefinition} from "./data";
import {PropertyDefinition} from "./property";
import {ComponentCore} from "./interfaces/core";
import {AttributeBindingDefinition, AttributeDefinition} from "./attribute";
import {JitValue, Value} from "./value";
import {StyleBindingDefinition, StyleDefinition} from "./style";
import {EventDefinition} from "./event";



export class NodeDefinition implements Instantiable {
    parent  : NodeDefinition;
    childen : Array<{| node : NodeDefinition, slot : ?string |}>;
    next    : NodeDefinition;
    prev    : NodeDefinition;
    $ref    : string;
    $refArr : boolean;

    // Instantiable interface realization
    lastInstance : ComponentCore;

    create (rt : ComponentCore, ts : ComponentCore) : ComponentCore {
        throw "never be called";
    }

    ref (reference : string, likeArray : boolean = false) {
        this.$ref    = reference;
        this.$refArr = likeArray;
    }
}

export class TextNodeDefinition extends NodeDefinition {
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

    create(rt: ComponentCore, ts: ComponentCore) : ComponentCore {
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

        this.lastInstance = new ComponentCore(node, {}, {"$" : value}, {}, {});
        return this.lastInstance;
    }
}

/**
 * Represents an Vasille.js component template
 * each template must have an id
 */
export class ElementNodeDefinition extends NodeDefinition {
    #tagName  : string;
    #building : boolean;

    $props : { [key : string] : PropertyDefinition };
    $data  : { [key : string] : DataDefinition };
    $attrs : { [key : string] : AttributeDefinition | AttributeBindingDefinition };
    $style : { [key : string] : StyleDefinition | StyleBindingDefinition };
    $event : { [key : string] : EventDefinition };

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

    defProp (name : string, _type : Function, ...init : Array<any>) : ElementNodeDefinition {
        this.$props[name] = new PropertyDefinition(name, _type, ...init);
        return this;
    }

    defProps (props : { [key: string] : Function }) : ElementNodeDefinition {
        for (let i in props) {
            if (props.hasOwnProperty(i)) {
                this.$props[i] = new PropertyDefinition(i, props[i]);
            }
        }
        return this;
    }

    defData (
        nameOrSet : string | { [key : string] : any },
        funcOrAny : ?Callable | ?any = null
    ) : ElementNodeDefinition {
        if (nameOrSet instanceof String && funcOrAny instanceof Function) {
            this.$data[nameOrSet] = new DataDefinition(nameOrSet, null, funcOrAny);
            return this;
        }

        if (nameOrSet instanceof String) {
            this.$data[nameOrSet] = new DataDefinition(nameOrSet, funcOrAny);
            return this;
        }

        if (nameOrSet instanceof Object && funcOrAny == null) {
            for (let i in nameOrSet) {
                if (nameOrSet.hasOwnProperty(i)) {
                    this.$data[i] = new DataDefinition(i, nameOrSet[i]);
                }
            }
            return this;
        }

        throw "Wrong function call";
    }

    defAttr (name : string, value : string | JitValue | Callable) : ElementNodeDefinition {
        if (value instanceof Function) {
            this.$attrs[name] = new AttributeDefinition(name, null, value);
        }
        else {
            this.$attrs[name] = new AttributeDefinition(name, value);
        }
        return this;
    }

    defAttrs (obj : { [key : string] : string | JitValue }) : ElementNodeDefinition {
        for (let i in obj) {
            this.$attrs[i] = new AttributeDefinition(i, obj[i]);
        }
        return this;
    }

    bindAttr (name : string, calculator : Function, ...values : Array<JitValue>) : ElementNodeDefinition {
        this.$attrs[name] = new AttributeBindingDefinition(name, calculator, ...values);
        return this;
    }

    defStyle (name : string, value : string | JitValue | Callable) : ElementNodeDefinition {
        if (value instanceof Function) {
            this.$style[name] = new StyleDefinition(name, null, value);
        }
        else {
            this.$style[name] = new StyleDefinition(name, value);
        }
        return this;
    }

    defStyles (obj : { [key : string] : string | JitValue }) : ElementNodeDefinition {
        for (let i in obj) {
            this.$style[i] = new StyleDefinition(i, obj[i]);
        }
        return this;
    }

    bindStyle (name : string, calculator : Function, ...values : Array<JitValue>) : ElementNodeDefinition {
        this.$style[name] = new StyleBindingDefinition(name, calculator, ...values);
        return this;
    }

    defEvent (name : string, event : Function) : ElementNodeDefinition {
        this.$event[name] = new EventDefinition(name, event);
        return this;
    }

    pushNode (node : NodeDefinition, slot : ?string) {
        if (!this.#building && !slot) {
            slot = "default";
        }

        let last : ?NodeDefinition = null;

        if (this.childen.length) {
            last = this.childen[this.childen.length - 1];
        }

        if (last) {
            last.next = node;
        }
        node.prev   = last;
        node.parent = this;

        this.childen.push({ node, slot });
    }

    defText (text : string, callback : ?(text : TextNodeDefinition) => void) : ElementNodeDefinition {
        let node = new TextNodeDefinition(new String(text));
        this.pushNode(node, null);
        if (callback) {
            callback(node);
        }
        return this;
    }

    bindText (text : IValue, callback : ?(text : TextNodeDefinition) => void) : ElementNodeDefinition {
        let node = new TextNodeDefinition(text);
        this.pushNode(node, null);
        if (callback) {
            callback(node);
        }
        return this;
    }

    defChild (tagName : string, callback : ?(node : ElementNodeDefinition) => void) : ElementNodeDefinition {
        let node = new ComponentCore(tagName);
        this.pushNode(node, null);
        if (callback) {
            callback(node);
        }
        return this;
    }

    defCustomChild (func : Function, callback : ?(node : ElementNodeDefinition) => void) : ElementNodeDefinition {
        let node = new Function();
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
export class Component extends ComponentCore {
}
