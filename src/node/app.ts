import { INode } from "./node";

interface AppOptions {
    debugUi ?: boolean
}

/**
 * Application Node
 * @class AppNode
 * @extends INode
 */
export class AppNode extends INode {
    /**
     * Enables debug comments
     */
    debugUi : boolean;

    /**
     * @param options {Object} Application options
     */
    constructor (options ?: AppOptions) {
        super();
        this.debugUi = options?.debugUi || false;
        this.seal();
    }
}

/**
 * Represents a Vasille.js application
 * @class App
 * @extends AppNode
 */
export class App extends AppNode {
    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param options {Object} Application options
     */
    constructor (node : Element, options ?: AppOptions) {
        super(options);

        this.$.node = node;
        this.preinit(this, this);

        this.seal();
    }

    public appendNode (node : Node) {
        node.appendChild(this.$.node);
    }
}
