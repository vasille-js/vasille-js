// @flow
import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";
import {userError} from "../core/errors";



/**
 * Describes a style attribute binding
 * @extends Binding
 */
export class StyleBinding extends Binding<string> {
    /**
     * Constructs a style binding attribute
     * @param rt {INode} is root component
     * @param ts {INode} is this component
     * @param name {string} is the name of style property
     * @param func {function} is the function to calc style value
     * @param values is the value to be synced
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
            else {
                throw userError('style can be applied to HTML elements only', 'non-html-element');
            }
        };
    }
}
