// @flow
import type {Callable} from "./interfaces/idefinition";
import type {IBind} from "./interfaces/ibind";
import type {IValue} from "./interfaces/ivalue";
import {Data} from "./data";
import {JitValue} from "./value";
import {Bind1x1, Binding} from "./bind";
import {Core} from "./interfaces/core";



/**
 * Represent a value bound to an style attribute
 */
export class Style extends Data {
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
    create(rt : Core, ts : Core): IBind {
        let value = super.create(rt, ts);
        let watch = function (value : IValue) {
            window.requestAnimationFrame(function () {
                ts.el.style.setProperty(this.name, value.get());
            }.bind(this));
        }.bind(this);

        watch(value);
        return new Bind1x1(watch, value);
    }
}

/**
 * Describes a style attribute
 */
export class StyleBinding extends Binding {
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
        return function (rt : Core, ts : Core, v : IValue) {
            window.requestAnimationFrame(function () {
                ts.el.style.setProperty(this.name, v.get());
            }.bind(this));
        }.bind(this);
    }
}
