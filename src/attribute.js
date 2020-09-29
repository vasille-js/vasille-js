// @flow
import type {Callable} from "./interfaces/idefinition";
import type {IBind} from "./interfaces/ibind";
import type {IValue} from "./interfaces/ivalue";
import {Bind1x1, BindingDefinition} from "./bind";
import {JitValue, Value} from "./value";
import {DataDefinition} from "./data";
import {ComponentCore} from "./interfaces/core";



/**
 * Represents a value bound to an attribute
 */
export class AttributeDefinition extends DataDefinition {
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
    createBind(rt: ComponentCore, ts: ComponentCore): IBind {
        let value = super.createValue(rt, ts);
        let watch = function (value : IValue) {
            if (value.get()) {
                ts.$el.setAttribute(this.name, value.get());
            }
            else {
                ts.$el.removeAttribute(this.name);
            }
        }.bind(this);

        watch(value);
        return new Bind1x1(watch, value);
    }

    create(rt: ComponentCore, ts: ComponentCore): IValue | IBind {
        return this.createBind(rt, ts);
    }
}

/**
 * Represents a Attribute binding description
 */
export class AttributeBindingDefinition extends BindingDefinition {
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
        return function (rt : ComponentCore, ts : ComponentCore, v : IValue) {
            let value : string = v.get();

            if (value) {
                ts.$el.setAttribute(this.name, value);
            }
            else {
                ts.$el.removeAttribute(this.name);
            }
        }.bind(this);
    }
}
