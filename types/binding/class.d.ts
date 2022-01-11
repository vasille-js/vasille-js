import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";
/**
 * Represents a HTML class binding description
 * @class ClassBinding
 * @extends Binding
 */
export declare class ClassBinding extends Binding<string | boolean> {
    /**
     * Constructs an HTML class binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of class
     * @param value {IValue} the value to bind
     */
    constructor(node: INode, name: string, value: IValue<string | boolean>);
    /**
     * Generates a function which updates the html class value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    protected bound(name: string): (node: INode, value: string | boolean) => void;
}
