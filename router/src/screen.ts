import { Fragment } from "vasille";
import { ScreenProps } from "./types.js";

export function screen<Node, Element, TagOptions extends object, Route extends string>(
    renderer: (node: Fragment<Node, Element, TagOptions>, input: ScreenProps<Route>) => Promise<void>,
): (props: ScreenProps<Route>, ctx?: Fragment<Node, Element, TagOptions>) => Promise<void> {
    return async function (props, node) {
        if (!node) {
            throw new Error("Vasille: Screen context is missing");
        }

        const frag = new Fragment<Node, Element, TagOptions>(node.runner);

        node.create(frag);

        await renderer(frag, props);
    };
}
