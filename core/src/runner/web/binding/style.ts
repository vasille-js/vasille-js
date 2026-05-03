import { Tag } from "../../../node/node.js";
import { Binding } from "./binding.js";
import type { IValue } from "../../../core/ivalue.js";

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
export class StyleBinding extends Binding<string | number | number[] | undefined> {
    /**
     * Constructs a style binding attribute
     * @param node {Tag} the vasille node
     * @param name {string} the name of style property
     * @param value {IValue} the value to bind
     */
    public constructor(
        node: Tag<Node, Element, object>,
        name: string,
        value: IValue<string | number | number[] | undefined>,
    ) {
        super(value);
        this.init(value => {
            /* istanbul ignore else */
            if (node.node instanceof HTMLElement && value !== undefined) {
                node.node.style.setProperty(name, stringifyStyleValue(value));
            }
        });
    }
}
