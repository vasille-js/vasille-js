import { Binding } from "./binding.js";
import type { Tag } from "../../../node/node.js";
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
        node: Tag<Node, Element, object>,
        name: string,
        value: IValue<string | number | boolean | null | undefined>,
    ) {
        super(value);

        this.init((value: string | number | boolean | null | undefined) => {
            if (value || value === 0) {
                if (typeof value === "boolean") {
                    node.node!.setAttribute(name, "");
                } else {
                    node.node!.setAttribute(name, `${value}`);
                }
            } else {
                node.node!.removeAttribute(name);
            }
        });
    }
}
