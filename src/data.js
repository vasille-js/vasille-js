// @flow

import type {Callable, IDefinition} from "./interfaces/idefinition";
import type {IValue} from "./interfaces/ivalue";
import type {IBind} from "./interfaces/ibind";
import {ComponentCore} from "./interfaces/core";
import {Value} from "./value";



/**
 * Describes a data field with default value
 */
export class DataDefinition implements IDefinition {
    #name  : string;
    #value : ?any;
    #func  : ?Callable;

    /**
     * Constructs a data field description
     * @param name is the name of field
     * @param value is the default value of field
     * @param func is the function to calc filed value
     */
    constructor(name : string, value : ?any = null, func : ?Callable = null) {
        this.#name = name;
        this.#func = func;
        this.#value = value;
    }

    /**
     * Gets the name of field
     * @returns {string} the name of field
     */
    get name () : string {
        return this.#name;
    }

    /**
     * Gets the value of field
     * @returns {?*} the value of field
     */
    get value () : ?any {
        return this.#value;
    }

    /**
     * Gets the calculate function
     * @returns {?Callable} the calculate function
     */
    get func () : ?Callable {
        return this.#func;
    }

    /**
     * Creates a value binding
     * @param rt is the root component
     * @param ts is the this component
     * @returns {Value} a value binding
     */
    createValue (rt : ComponentCore, ts : ComponentCore) : IValue {
        if (this.#func) {
            let v = this.#func(rt, ts);
            if (v instanceof Value) {
                return new Value(v.get());
            }
            else {
                return new Value(v);
            }
        }
        else {
            if (this.#value instanceof Value) {
                return new Value(this.#value.get());
            }
            else {
                return new Value(this.#value);
            }
        }
    }

    create (rt : ComponentCore, ts : ComponentCore) : IValue | IBind {
        return this.createValue(rt, ts);
    }
}
