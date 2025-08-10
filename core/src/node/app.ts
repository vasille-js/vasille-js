import { Fragment, Root } from "./node.js";
import { Runner } from "./runner.js";

/**
 * Represents a Vasille.js application
 * @class App
 * @extends Root
 */
export class App<Node, Element, TagOptions extends object, T extends object = object> extends Root<
    Node,
    Element,
    TagOptions,
    T
> {
    private readonly node: Element;

    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param runner {Runner} A adapter which execute DOM manipulation
     * @param input Props of the component
     */
    constructor(node: Element, runner: Runner<Node, Element, TagOptions>, input: T) {
        super(input, runner);

        this.node = node;
    }

    public appendNode(node: Node) {
        this.runner.appendChild(this.node, node);
    }
}

interface PortalOptions<Node, Element, TagOptions extends object> {
    node: Element;
    slot?: (ctx: Fragment<Node, Element, TagOptions>) => void;
}

export class Portal<Node, Element, TagOptions extends object> extends Fragment<Node, Element, TagOptions> {
    private readonly node: Element;

    constructor(input: PortalOptions<Node, Element, TagOptions>, runner: Runner<Node, Element, TagOptions>) {
        super(input, runner, ":portal");

        this.node = input.node;
    }

    public appendNode(node: Node) {
        this.runner.appendChild(this.node, node);
    }
}
