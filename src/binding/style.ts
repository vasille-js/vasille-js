import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";



/**
 * Describes a style attribute binding
 * @class StyleBinding
 * @extends Binding
 */
export class StyleBinding extends Binding<string> {
    /**
     * Constructs a style binding attribute
     * @param node {INode} the vasille node
     * @param name {string} the name of style property
     * @param value {IValue} the value to bind
     */
    public constructor (
        node : INode,
        name : string,
        value : IValue<string>
    ) {
        super(node, name, value);
    }

    /**
     * Generates a function to update style property value
     * @param name {string}
     * @returns {Function} a function to update style property
     */
    protected bound (name : string) : (node : INode, value : string) => void {
        return function (node : INode, value : string) {
            if (node.node instanceof HTMLElement) {
                node.app.$run.setStyle(node.node, name, value);
            }
        };
    }
}
