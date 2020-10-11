// @flow

import type {IValue} from "./ivalue";
import type {Destroyable} from "./destroyable";
import {destroyObject} from "./destroyObject";



export type LiveFields = { [key : string] : IValue };

/**
 * Represents an Vasille.js component core
 */
export class Core implements Destroyable {
    #el    : HTMLElement | Text;
    #props : LiveFields;
    #data  : LiveFields;
    #attrs : LiveFields;
    #style : LiveFields;

    constructor (
        el : HTMLElement | Text,
        props : LiveFields,
        data: LiveFields,
        attrs: LiveFields,
        style: LiveFields
    ) {
        this.#el    = el;
        this.#props = Object.freeze(props);
        this.#data  = Object.freeze(data);
        this.#attrs = Object.freeze(attrs);
        this.#style = Object.freeze(style);
    }

    get el () : ?HTMLElement {
        if (this.#el instanceof HTMLElement) {
            return this.#el;
        }
    }

    get text () : ?Text {
        if (this.#el instanceof Text) {
            return this.#el;
        }
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

    destroy () {
        destroyObject(this.#props);
        destroyObject(this.#data);
        destroyObject(this.#attrs);
        destroyObject(this.#style);
    }
}
