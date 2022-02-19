import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";



/**
 * Represents an Attribute binding description
 * @class AttributeBinding
 * @extends Binding
 */
export class AttributeBinding extends Binding<string> {
    /**
     * Constructs an attribute binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of attribute
     * @param value {IValue} value to bind
     */
    public constructor (
        node : INode,
        name : string,
        value : IValue<string>
    ) {
        super(value);

        this.init((value : string) => {
            if (value) {
                node.app.run.setAttribute(node.node, name, value);
            }
            else {
                node.app.run.removeAttribute(node.node, name);
            }
        });
        this.seal();
    }
}
