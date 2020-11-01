// @flow
import {Callable} from "./interfaces/idefinition";
import {IValue}   from "./interfaces/ivalue";

import {Binding}        from "./bind";
import {BaseNode}       from "./node";
import {propertify}     from "./property";


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
    rt    : BaseNode,
    ts    : BaseNode,
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
        rt        : BaseNode,
        ts        : BaseNode,
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
        return function (rt : BaseNode, ts : BaseNode, v : IValue) {
            window.requestAnimationFrame(function () {
                if (ts.el) ts.el.style.setProperty(name, v.get());
            });

            return v.get();
        };
    }
}
