// @flow
import type {Callable, IDefinition} from "./interfaces/idefinition";
import {DataDefinition} from "./data";
import {PropertyDefinition} from "./property";
import {ComponentCore} from "./interfaces/core";
import {AttributeBindingDefinition, AttributeDefinition} from "./attribute";
import {JitValue} from "./value";
import {StyleBindingDefinition, StyleDefinition} from "./style";
import {EventDefinition} from "./event";



/**
 * Represents an Vasille.js component template
 * each template must have an id
 */
export class Template {
    #tagName : string;
    _id      : string;

    $props : { [key : string] : PropertyDefinition };
    $data  : { [key : string] : DataDefinition };
    $attrs : { [key : string] : AttributeDefinition | AttributeBindingDefinition };
    $style : { [key : string] : StyleDefinition | StyleBindingDefinition };
    $event : { [key : string] : EventDefinition };
    $dom   : { [key : string] : IDefinition };
    $refs  : { [key : string] : IDefinition };

    constructor(tagName : string) {
        this.#tagName = tagName;

        this.createProps();
        this.createData();
        this.createAttrs();
        this.createStyle();
        this.createBinds();
        this.createEvents();
        this.createDom();
    }

    createProps  () { /* to be overloaded */ }
    createData   () { /* to be overloaded */ }
    createAttrs  () { /* to be overloaded */ }
    createStyle  () { /* to be overloaded */ }
    createBinds  () { /* to be overloaded */ }
    createEvents () { /* to be overloaded */ }
    createDom    () { /* to be overloaded */ }

    defProp (name : string, _type : Function, ...init : Array<any>) {
        this.$props[name] = new PropertyDefinition(name, _type, ...init);
    }

    defProps (props : { [key: string] : Function }) {
        for (let i in props) {
            if (props.hasOwnProperty(i)) {
                this.$props[i] = new PropertyDefinition(i, props[i]);
            }
        }
    }

    defData (
        nameOrSet : string | { [key : string] : any },
        funcOrAny : ?Callable | ?any = null
    ) : ?DataDefinition {
        if (nameOrSet instanceof String && funcOrAny instanceof Function) {
            return this.$data[nameOrSet] = new DataDefinition(nameOrSet, null, funcOrAny);
        }

        if (nameOrSet instanceof String) {
            return this.$data[nameOrSet] = new DataDefinition(nameOrSet, funcOrAny);
        }

        if (nameOrSet instanceof Object && funcOrAny == null) {
            for (let i in nameOrSet) {
                if (nameOrSet.hasOwnProperty(i)) {
                    this.$data[i] = new DataDefinition(i, nameOrSet[i]);
                }
            }
        }

        throw "Wrong function call";
    }

    defAttr (name : string, value : string | JitValue | Callable) {
        if (value instanceof Function) {
            this.$attrs[name] = new AttributeDefinition(name, null, value);
        }
        else {
            this.$attrs[name] = new AttributeDefinition(name, value);
        }
    }

    defAttrs (obj : { [key : string] : string | JitValue }) {
        for (let i in obj) {
            this.$attrs[i] = new AttributeDefinition(i, obj[i]);
        }
    }

    bindAttr (name : string, calculator : Function, ...values : Array<JitValue>) {
        this.$attrs[name] = new AttributeBindingDefinition(name, calculator, ...values);
    }

    defStyle (name : string, value : string | JitValue | Callable) {
        if (value instanceof Function) {
            this.$style[name] = new StyleDefinition(name, null, value);
        }
        else {
            this.$style[name] = new StyleDefinition(name, value);
        }
    }

    defStyles (obj : { [key : string] : string | JitValue }) {
        for (let i in obj) {
            this.$style[i] = new StyleDefinition(i, obj[i]);
        }
    }

    bindStyle (name : string, calculator : Function, ...values : Array<JitValue>) {
        this.$style[name] = new StyleBindingDefinition(name, calculator, ...values);
    }

    defEvent (name : string, event : Function) {
        this.$event[name] = new EventDefinition(name, event);
    }

    //createChildren
}

/**
 * Represents an Vasille.js component
 */
export class Component extends ComponentCore {
}
