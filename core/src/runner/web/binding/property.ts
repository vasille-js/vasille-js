import { IValue } from "../../../core/ivalue.js";
import type { INode } from "../../../node/node.js";
import { Binding } from "./binding.js";

/**
 * Represents a property binding
 * @class PropertyBinding
 * @extends Binding
 */
export class PropertyBinding<T> extends Binding<T> {
    /**
     * Constructs a property binding description
     * @param node the vasille node
     * @param name the name of property
     * @param value the value of property
     */
    public constructor(node: INode<Node, Element, object>, name: string, value: IValue<T>) {
        super(value);

        this.init(value => {
            (node.element as unknown as Record<string, unknown>)[name] = value;
        });
    }
}
