import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";

/**
 * Represents an Attribute binding description
 * @class AttributeBinding
 * @extends Binding
 */
export class AttributeBinding extends Binding<string | number | boolean | null> {
    /**
     * Constructs an attribute binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of attribute
     * @param value {IValue} value to bind
     */
    public constructor(node: INode, name: string, value: IValue<string | number | boolean | null>) {
        super(value);

        this.init((value: string | number | boolean | null) => {
            if (value) {
                if (typeof value === "boolean") {
                    node.node.setAttribute(name, "");
                } else {
                    node.node.setAttribute(name, `${value}`);
                }
            } else {
                node.node.removeAttribute(name);
            }
        });
        this.$seal();
    }
}
