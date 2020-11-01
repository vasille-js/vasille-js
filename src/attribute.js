// @flow
import {Callable} from "./interfaces/idefinition";
import {IValue}   from "./interfaces/ivalue";

import {Bind1, Binding} from "./bind";
import {BaseNode}       from "./node";
import {propertify}     from "./property";


/**
 * Creates a attribute 1 to 1 bind
 * @param rt {BaseNode} is the root component
 * @param ts {BaseNode} is the this component
 * @param name {String} is attribute name
 * @param value {?any} is attribute value
 * @param func {?Callable} is attribute value calculation function
 * @returns {AttributeBinding} 1 to 1 bind of attribute
 */
export function attributify (
    rt    : BaseNode,
    ts    : BaseNode,
    name  : string,
    value : ?any = null,
    func  : ?Callable = null
) : AttributeBinding {
    return new AttributeBinding(rt, ts, name, null, propertify(rt, ts, value, func));
}

/**
 * Represents a Attribute binding description
 * @extends Binding
 */
export class AttributeBinding extends Binding {
    /**
     * Constructs a attribute binding description
     * @param rt {BaseNode} is root component
     * @param ts {BaseNode} is this component
     * @param name {String} is the name of attribute
     * @param func {?Function} is the function to bound
     * @param values {Array<IValue>} is the array of values to bind to
     */
    constructor (
        rt        : BaseNode,
        ts        : BaseNode,
        name      : string,
        func      : ?Function,
        ...values : Array<IValue>
    ) {
        super(rt, ts, name, func, ...values);
    }

    /**
     * Generates a function which updates the attribute value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    bound (name : string) : Function {
        return function (rt: BaseNode, ts: BaseNode, v: IValue) {
            let value: string = v.get();

            if (value) {
                window.requestAnimationFrame(function () {
                    if (ts.el) ts.el.setAttribute(name, value);
                });
            }
            else {
                window.requestAnimationFrame(function () {
                    if (ts.el) ts.el.removeAttribute(name);
                });
            }

            return v.get();
        };
    }
}
