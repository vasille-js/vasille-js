// @flow
import type {Callable} from "./interfaces/idefinition";
import type {IBind} from "./interfaces/ibind";
import type {IValue} from "./interfaces/ivalue";
import {DataDefinition} from "./data";
import {JitValue} from "./value";
import {Bind1x1, BindingDefinition} from "./bind";
import {ComponentCore} from "./interfaces/core";



/**
 * Represent a value bound to an style attribute
 */
export class StyleDefinition extends DataDefinition {
    /**
     * Constructs a style description
     * @param name {string} is the name of style property
     * @param value {?any} is the value of style property
     * @param func {?Function} is the function to bind
     */
    constructor (
        name  : string,
        value : ?any = null,
        func  : ?Callable = null
    ) {
        super(name, value, func);
    }

    /**
     * Creates a bind for style attribute
     * @param rt is the root component
     * @param ts is the this component
     * @returns {Bind1x1} a bind for style attribute
     */
    create(rt : ComponentCore, ts : ComponentCore): IBind {
        let value = super.create(rt, ts);
        let watch = function (value : IValue) {
            ts.$el.style.setProperty(this.name, value.get());
        }.bind(this);

        watch(value);
        return new Bind1x1(watch, value);
    }
}

/**
 * Describes a style attribute
 */
export class StyleBindingDefinition extends BindingDefinition {
    /**
     * Constructs a style binding attribute
     * @param name is the name of style property
     * @param func is the function to calc style value
     * @param values is the value to be synced
     */
    constructor(
        name      : string,
        func      : Function,
        ...values : Array<JitValue>
    ) {
        super(name, func, ...values);
    }

    /**
     * Generates a function to update style property value
     * @returns {*} a function to update style property
     */
    bound() : Function {
        return function (rt : ComponentCore, ts : ComponentCore, v : IValue) {
            ts.$el.style.setProperty(this.name, v.get());
        }.bind(this);
    }
}
