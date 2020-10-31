// @flow

import type {IValue} from "./ivalue";
import type {Destroyable} from "./destroyable";
import {destroyObject} from "./destroyObject";



export type LiveFields = { [key : string] : IValue };
export type CoreEl = HTMLElement | Text | Comment;

/**
 * Represents an Vasille.js component core
 */
export class Core implements Destroyable {
    $el    : CoreEl;
    $props : LiveFields = {};
    $data  : LiveFields = {};
    $attrs : LiveFields = {};
    $style : LiveFields = {};

    constructor (el : CoreEl) {
        this.$el = el;
    }

    get coreEl () : ?CoreEl {
        return this.$el;
    }

    get el () : ?HTMLElement {
        let el = this.coreEl;
        if (el instanceof HTMLElement) {
            return el;
        }
    }

    get text () : ?Text {
        let el = this.coreEl;
        if (el instanceof Text) {
            return el;
        }
    }

    get comment () : ?Comment {
        let el = this.coreEl;
        if (el instanceof Comment) {
            return el;
        }
    }

    get props () : LiveFields {
        return this.$props;
    }

    get data () : LiveFields {
        return this.$data;
    }

    get attrs () : LiveFields {
        return this.$attrs;
    }

    get style () : LiveFields {
        return this.$style;
    }

    destroy () {
        destroyObject(this.$props);
        destroyObject(this.$data);
        destroyObject(this.$attrs);
        destroyObject(this.$style);
    }
}
