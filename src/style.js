// @flow
import {Callable} from "./interfaces/idefinition.js";
import {IValue}   from "./interfaces/ivalue.js";

import {Binding}        from "./bind.js";
import {propertify}     from "./property.js";


/**
 * Constructs a style attribute value
 * @param rt {BaseNode} The root node
 * @param ts {BaseNode} The this node
 * @param name {String} The style attribute name
 * @param value {String | IValue | null} A value for attribute
 * @param func {?Callable} A getter of attribute value
 * @return {StyleBinding} A ready style binding
 */
export function stylify(
    rt    : any,
    ts    : any,
    name  : string,
    value : ?string | ?IValue = null,
    func  : ?Callable = null
) : StyleBinding {
    return new StyleBinding(rt, ts, name, null, propertify(rt, ts, value, func));
}

/**
 * Describes a style attribute binding
 * @extends Binding
 */
export class StyleBinding extends Binding {
    /**
     * Constructs a style binding attribute
     * @param rt is root component
     * @param ts is this component
     * @param name is the name of style property
     * @param func is the function to calc style value
     * @param values is the value to be synced
     */
    constructor(
        rt        : any,
        ts        : any,
        name      : string,
        func      : ?Function,
        ...values : Array<IValue>
    ) {
        super(rt, ts, name, func, ...values);
    }

    /**
     * Generates a function to update style property value
     * @returns {Function} a function to update style property
     */
    bound (name : string) : Function {
        return function (rt : any, ts : any, v : IValue) {
            window.requestAnimationFrame(function () {
                if (ts.el) ts.el.style.setProperty(name, v.get());
            });

            return v.get();
        };
    }
}
