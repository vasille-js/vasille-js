import { Destroyable } from "../core/destroyable";
import type { IValue } from "../core/ivalue";
import type { INode } from "../node/node";
/**
 * Describe a common binding logic
 * @class Binding
 * @extends Destroyable
 */
export declare class Binding<T> extends Destroyable {
    private binding;
    private readonly updateFunc;
    /**
     * Constructs a common binding logic
     * @param node {INode} the vasille node
     * @param name {String} the name of property/attribute/class
     * @param value {IValue} the value to bind
     */
    constructor(node: INode, name: string, value: IValue<T>);
    /**
     * Is a virtual function to get the specific bind function
     * @param name {String} the name of attribute/property
     * @returns {Function} a function to update attribute/property value
     * @throws Always throws and must be overloaded in child class
     */
    protected bound(name: string): (node: INode, value: T) => void;
    /**
     * Just clear bindings
     */
    $destroy(): void;
}
