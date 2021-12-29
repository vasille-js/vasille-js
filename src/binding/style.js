// @flow
import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";



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
    constructor (
        rt : INode,
        ts : INode,
        name : string,
        value : IValue<string>
    ) {
        super(rt, ts, name, value);
    }

    /**
     * Generates a function to update style property value
     * @param name {string}
     * @returns {Function} a function to update style property
     */
    bound (name : string) : (rt : INode, ts : INode, value : string) => void {
        return function (rt : INode, ts : INode, value : string) {
            if (rt.$) {
                rt.$.app.$run.setStyle(ts.$.el, name, value);
            }
        };
    }
}
