import { Fragment, Root } from "./node";

/**
 * Represents a Vasille.js application
 * @class App
 * @extends AppNode
 */
export class App<T extends object = object> extends Root<T> {
    #node: Element;

    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param input
     */
    constructor(node: Element, input: T) {
        super(input);

        this.#node = node;
    }

    public appendNode(node: Node) {
        this.#node.appendChild(node);
    }
}

interface PortalOptions {
    node: Element;
    slot?: (this: Fragment) => void;
}

export class Portal extends Fragment {
    #node: Element;

    constructor(parent: Root, input: PortalOptions) {
        super(parent, input, ":portal");

        this.#node = input.node;
    }

    public appendNode(node: Node) {
        this.#node.appendChild(node);
    }
}
