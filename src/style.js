// @flow
import { Binding }    from "./bind.js";
import { Callable }   from "./interfaces/idefinition.js";
import { IValue }     from "./interfaces/ivalue.js";
import type { BaseNode }   from "./node";
import { propertify } from "./property.js";



/**
 * Constructs a style attribute value
 * @param rt {BaseNode} The root node
 * @param ts {BaseNode} The this node
 * @param name {String} The style attribute name
 * @param value {String | IValue | null} A value for attribute
 * @param func {?Callable} A getter of attribute value
 * @return {StyleBinding} A ready style binding
 */
export function stylify (
    rt : BaseNode,
    ts : BaseNode,
    name : string,
    value : ?string | ?IValue<string> = null,
    func : ?Callable                  = null
) : StyleBinding {
    return new StyleBinding(rt, ts, name, null, propertify(value, func));
}

/**
 * Describes a style attribute binding
 * @extends Binding
 */
export class StyleBinding extends Binding {
    /**
     * Constructs a style binding attribute
     * @param rt {BaseNode} is root component
     * @param ts {BaseNode} is this component
     * @param name {string} is the name of style property
     * @param func {function} is the function to calc style value
     * @param values is the value to be synced
     */
    constructor (
        rt : BaseNode,
        ts : BaseNode,
        name : string,
        func : ?Function,
        ...values : Array<IValue<string>>
    ) {
        super(rt, ts, name, func, ...values);
    }

    /**
     * Generates a function to update style property value
     * @param name {string}
     * @returns {Function} a function to update style property
     */
    bound (name : string) : Function {
        return function (rt : any, ts : any, value : string) {
            if (rt.$) {
                rt.$.app.$run.setStyle(ts.$.el, name, value);
            }
            return value;
        };
    }
}
