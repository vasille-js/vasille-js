import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";
/**
 * Represents an Attribute binding description
 * @class AttributeBinding
 * @extends Binding
 */
export declare class AttributeBinding extends Binding<string> {
    /**
     * Constructs an attribute binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of attribute
     * @param value {IValue} value to bind
     */
    constructor(node: INode, name: string, value: IValue<string>);
}
