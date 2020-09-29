// @flow
import type {Callable, IDefinition} from "./interfaces/idefinition";
import {DataDefinition} from "./data";
import {PropertyDefinition} from "./property";
import {ComponentCore} from "./interfaces/core";
import {AttributeDefinition} from "./attribute";
import {Value} from "./value";



/**
 * Represents an Vasille.js component
 */
export class Template {
    #tagName : string;

    $props : { [key : string] : IDefinition };
    $data  : { [key : string] : IDefinition };
    $attrs : { [key : string] : IDefinition };
    $style : { [key : string] : IDefinition };
    $binds : { [key : string] : IDefinition };
    $event : { [key : string] : IDefinition };
    $dom   : { [key : string] : IDefinition };
    $refs  : { [key : string] : IDefinition };

    constructor() {
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

    defProps (props : { [key: string] : Function}) {
        for (let i in props) {
            if (props.hasOwnProperty(i)) {
                this.$props[i] = new PropertyDefinition(i, props[i]);
            }
        }
    }

    defData (
        nameOrSet : string | { [key : string] : any },
        funcOrAny : ?Callable | ?any = null
    ) : void {
        if (nameOrSet instanceof String && funcOrAny instanceof Function) {
            this.$data[nameOrSet] = new DataDefinition(nameOrSet, null, funcOrAny);
            return;
        }

        if (nameOrSet instanceof String) {
            this.$data[nameOrSet] = new DataDefinition(nameOrSet, funcOrAny);
            return;
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

    defAttr (name : string, value : string | Value | Callable) {
        if (value instanceof Function) {
            this.$attrs[name] = new AttributeDefinition(name, null, value);
        }
        else {
            this.$attrs[name] = new AttributeDefinition(name, value);
        }
    }

    //createAttrs
    //createStyle
    //createBinds
    //createEvents
    //createChildren

    get $el () : HTMLElement {
        return this.#el;
    }
}

/**
 * Represents an Vasille.js component
 */
export class Component extends ComponentCore {
}
