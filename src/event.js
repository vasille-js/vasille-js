// @flow

import type {IDefinition} from "./interfaces/idefinition";
import type {IValue} from "./interfaces/ivalue";
import {Core} from "./interfaces/core";
import {Value} from "./value";



export class Event implements IDefinition {
    #name    : string;
    #handler : Function;

    constructor (name : string, handler : Function) {
        this.#name    = name;
        this.#handler = handler;
    }

    get name () : string {
        return this.#name;
    }

    create(rt : Core, ts : Core) : IValue {
        let listener = this.#handler.bind(null, rt, ts);
        let value    = new Value(listener);

        ts.el.addEventListener(this.#name, listener);
        value.on(function (name : string, v : Value) {
            ts.el.removeEventListener(name, this.listener);
            this.listener = v.get().bind(null, rt, ts);
            ts.el.addEventListener(name, this.listener);
        }.bind({listener}, this.#name, value));

        return value;
    }
}
