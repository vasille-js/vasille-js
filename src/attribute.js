// @flow
import type {Callable} from "./interfaces/idefinition";
import type {IBind} from "./interfaces/ibind";
import type {IValue} from "./interfaces/ivalue";
import {Bind1x1, Binding} from "./bind";
import {JitValue, Value} from "./value";
import {Data} from "./data";
import {Core} from "./interfaces/core";



/**
 * Represents a value bound to an attribute
 */
export class Attribute extends Data {
    constructor (
        name  : string,
        value : ?any      = null,
        func  : ?Callable = null
    ) {
        super(name, value, func);
    }

    /**
     * Creates a attribute 1 to 1 bind
     * @param rt is the root component
     * @param ts is the this component
     * @returns {Bind1x1} attribute 1 to 1 bind
     */
    createBind(rt: Core, ts: Core): IBind {
        let value = super.createValue(rt, ts);
        let watch = function (value : IValue) {
            if (value.get()) {
                window.requestAnimationFrame(function () {
                    ts.el.setAttribute(this.name, value.get());
                }.bind(this));
            }
            else {
                window.requestAnimationFrame(function () {
                    ts.el.removeAttribute(this.name);
                }.bind(this));
            }
        }.bind(this);

        watch(value);
        return new Bind1x1(watch, value);
    }

    create(rt: Core, ts: Core): IValue | IBind {
        return this.createBind(rt, ts);
    }
}

/**
 * Represents a Attribute binding description
 */
export class AttributeBinding extends Binding {
    /**
     * Constructs a attribute binding description
     * @param name {string} is the name of attribute
     * @param func {Function} is the function to bound
     * @param values {Array<Value>} is the array of value to bind to
     */
    constructor(
        name : string,
        func: Function,
        ...values : Array<JitValue>
    ) {
        super(name, func, ...values);
    }

    /**
     * Updates element attribute by name
     * @returns {*} a function which will update attribute value
     */
    bound(): Function {
        return function (rt : Core, ts : Core, v : IValue) {
            let value : string = v.get();

            if (value) {
                window.requestAnimationFrame(function () {
                    ts.el.setAttribute(this.name, value);
                }.bind(this));
            }
            else {
                window.requestAnimationFrame(function () {
                    ts.el.removeAttribute(this.name);
                }.bind(this));
            }
        }.bind(this);
    }
}
