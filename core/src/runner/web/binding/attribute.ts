import { Binding } from "./binding.js";
import type { INode } from "../../../node/node.js";
import type { IValue } from "../../../core/ivalue.js";

/**
 * Represents an Attribute binding description
 * @class AttributeBinding
 * @extends Binding
 */
export class AttributeBinding extends Binding<string | number | boolean | null | undefined> {
    /**
     * Constructs an attribute binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of attribute
     * @param value {IValue} value to bind
     */
    public constructor(
        node: INode<Node, Element, object>,
        name: string,
        value: IValue<string | number | boolean | null | undefined>,
    ) {
        super(value);

        this.init((value: string | number | boolean | null | undefined) => {
            if (value) {
                if (typeof value === "boolean") {
                    node.element.setAttribute(name, "");
                } else {
                    node.element.setAttribute(name, `${value}`);
                }
            } else {
                node.element.removeAttribute(name);
            }
        });
    }
}
