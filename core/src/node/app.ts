import { Fragment, INode } from "./node";
import { FragmentOptions, TagOptions } from "../functional/options";
import { AcceptedTagsMap } from "../spec/react";

/**
 * Represents a Vasille.js application
 * @class App
 * @extends AppNode
 */
export class App<T extends FragmentOptions = FragmentOptions> extends Fragment {
    #node: Element;

    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param input
     */
    constructor(node: Element, input: T) {
        super(input);

        this.#node = node;
        this.preinit(this, this);
        this.init();
    }

    public appendNode(node: Node) {
        this.#node.appendChild(node);
    }
}

interface PortalOptions extends FragmentOptions {
    node: Element;
    slot?: (node: Fragment) => void;
}

export class Portal extends Fragment {
    #node: Element;

    constructor(input: PortalOptions) {
        super(input);

        this.#node = input.node;
    }

    public appendNode(node: Node) {
        this.#node.appendChild(node);
    }
}
