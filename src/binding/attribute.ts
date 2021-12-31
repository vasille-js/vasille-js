// @flow
import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";



/**
 * Represents an Attribute binding description
 * @extends Binding
 */
export class AttributeBinding extends Binding<string> {
    /**
     * Constructs an attribute binding description
     * @param rt {INode} is root component
     * @param ts {INode} is this component
     * @param name {String} is the name of attribute
     * @param func {?Function} is the function to bound
     * @param values {Array<IValue>} is the array of values to bind to
     */
    public constructor (
        node : INode,
        name : string,
        value : IValue<string>
    ) {
        super(node, name, value);
    }

    /**
     * Generates a function which updates the attribute value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    protected bound (name : string) : (node : INode, value : string) => void {
        return function (node : INode, value : string) {
            if (value) {
                node.app.$run.setAttribute(node.node, name, value);
            }
            else {
                node.app.$run.removeAttribute(node.node, name);
            }
        };
    }
}
