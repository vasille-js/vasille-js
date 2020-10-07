// @flow

import type {IValue} from "./ivalue";
import type {IBind} from "./ibind";
import type {Destroyable} from "./destroyable";
import {destroyObject} from "./destroyObject";



export type LiveFields = { [key : string] : IValue | IBind };

/**
 * Represents an Vasille.js component core
 */
export class ComponentCore implements Destroyable {
    #el     : HTMLElement;
    #props : LiveFields;
    #data  : LiveFields;
    #attrs : LiveFields;
    #style : LiveFields;
    #binds : LiveFields;

    constructor (
        el : HTMLElement,
        props : LiveFields,
        data: LiveFields,
        attrs: LiveFields,
        style: LiveFields,
        binds: LiveFields
    ) {
        this.#el    = el;
        this.#props = Object.freeze(props);
        this.#data  = Object.freeze(data);
        this.#attrs = Object.freeze(attrs);
        this.#style = Object.freeze(style);
        this.#binds = Object.freeze(binds);
    }

    get el () : HTMLElement {
        return this.#el;
    }

    get props () : LiveFields {
        return this.#props;
    }

    get data () : LiveFields {
        return this.#data;
    }

    get attrs () : LiveFields {
        return this.#attrs;
    }

    get style () : LiveFields {
        return this.#style;
    }

    get binds () : LiveFields {
        return this.#binds;
    }

    destroy () {
        destroyObject(this.#props);
        destroyObject(this.#data);
        destroyObject(this.#attrs);
        destroyObject(this.#style);
        destroyObject(this.#binds);
    }
}
