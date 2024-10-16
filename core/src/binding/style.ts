import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";

export function stringifyStyleValue(value: string | number | number[]): string {
    if (value instanceof Array) {
        return value.map(item => `${item}px`).join(" ");
    }
    if (typeof value === "number") {
        return `${value}px`;
    }

    return value;
}

/**
 * Describes a style attribute binding
 * @class StyleBinding
 * @extends Binding
 */
export class StyleBinding extends Binding<string | number | number[]> {
    /**
     * Constructs a style binding attribute
     * @param node {INode} the vasille node
     * @param name {string} the name of style property
     * @param value {IValue} the value to bind
     */
    public constructor(node: INode, name: string, value: IValue<string | number | number[]>) {
        super(value);
        this.init(value => {
            if (node.node instanceof HTMLElement) {
                node.node.style.setProperty(name, stringifyStyleValue(value));
            }
        });
        this.$seal();
    }
}
