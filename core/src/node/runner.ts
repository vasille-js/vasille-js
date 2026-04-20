import { Tag, TextNode } from "./node.js";

/**
 * A runner executes DOM manipulations
 */
export interface IRunner<Node, Element, TagOptions extends object> {
    insertBefore(node: Node, before: Node | Element): void;
    appendChild(node: Element, child: Node | Element): void;

    textNode(deep: number, text: unknown): TextNode<Node, Element, TagOptions>;
    tag(
        deep: number,
        tagName: string,
        input: TagOptions,
        cb?: (ctx: Tag<Node, Element, TagOptions>) => void,
    ): Tag<Node, Element, TagOptions>;
}
