import {Fragment, INode} from "./node";
import {TagOptions} from "../functional/options";

interface AppOptions {
    debugUi ?: boolean
}

/**
 * Application Node
 * @class AppNode
 * @extends INode
 */
export class AppNode<T extends TagOptions<any> = TagOptions<any>> extends INode<T> {
    /**
     * Enables debug comments
     */
    debugUi : boolean;

    /**
     * @param input
     * @param options {Object} Application options
     */
    constructor (input : T, options ?: AppOptions) {
        super(input);
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
        super({}, options);

        this.$.node = node;
        this.preinit(this, this);
        this.init();

        this.seal();
    }

    public appendNode (node : Node) {
        this.$.node.appendChild(node);
    }
}

interface PortalOptions extends TagOptions<'div'> {
    node : Element
    slot : (node : Fragment) => void
}

export class Portal extends AppNode<PortalOptions> {
    constructor (input : PortalOptions) {
        super(input, {});

        this.$.node = input.node;

        this.seal();
    }

    public appendNode (node : Node) {
        this.$.node.appendChild(node);
    }

    protected compose(input: PortalOptions) {
        input.slot(this);
    }
}
