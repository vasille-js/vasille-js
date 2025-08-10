import { IValue } from "../core/ivalue.js";
import { DebugNode, Tag, TextNode } from "./node.js";

/**
 * A runner executes DOM manipulations
 */
export interface Runner<Node, Element, TagOptions extends object> {
    debugUi: boolean;

    insertBefore(node: Node, before: Node | Element): void;
    appendChild(node: Element, child: Node | Element): void;

    textNode(text: unknown): TextNode<Node, Element, TagOptions>;
    debugNode(text: IValue<unknown>): DebugNode<Node, Element, TagOptions>;
    tag(
        tagName: string,
        input: TagOptions,
        cb?: (ctx: Tag<Node, Element, TagOptions>) => void,
    ): Tag<Node, Element, TagOptions>;
}
