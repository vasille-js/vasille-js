// @flow
import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";



/**
 * Represents an Attribute binding description
 * @extends Binding
 */
export class AttributeBinding extends Binding<?string> {
    /**
     * Constructs an attribute binding description
     * @param rt {INode} is root component
     * @param ts {INode} is this component
     * @param name {String} is the name of attribute
     * @param func {?Function} is the function to bound
     * @param values {Array<IValue>} is the array of values to bind to
     */
    constructor (
        rt : INode,
        ts : INode,
        name : string,
        value : IValue<?string>
    ) {
        super(rt, ts, name, value);
    }

    /**
     * Generates a function which updates the attribute value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    bound (name : string) : (rt : INode, ts : INode, value : ?string) => void {
        return function (rt : INode, ts : INode, value : ?string) {
            if (value) {
                rt.$.app.$run.setAttribute(ts.$.el, name, value);
            }
            else {
                rt.$.app.$run.removeAttribute(ts.$.el, name);
            }
        };
    }
}
