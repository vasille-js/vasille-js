import { Fragment, Root } from "./node.js";
import { IRunner } from "./runner.js";

/**
 * Represents a Vasille.js application
 * @class App
 * @extends Root
 */
export class App<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends Root<Node, Element, TagOptions, Runner> {
    private readonly node: Element;

    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param runner {IRunner} A adapter which execute DOM manipulation
     */
    constructor(node: Element, runner: Runner) {
        super(runner);

        this.node = node;
    }

    public appendNode(node: Node) {
        this.runner.appendChild(this.node, node);
    }
}

export interface PortalOptions<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions>,
> {
    node: Element;
    slot?: (ctx: Fragment<Node, Element, TagOptions, Runner>) => void;
}

export class Portal<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends Fragment<Node, Element, TagOptions, Runner> {
    private readonly node: Element;

    constructor(input: PortalOptions<Node, Element, TagOptions, Runner>, runner: Runner) {
        super(runner);

        this.node = input.node;
    }

    public override appendNode(node: Node) {
        this.runner.appendChild(this.node, node);
    }
}
