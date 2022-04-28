import {Fragment, INode} from "./node";
import {TagOptions} from "../functional/options";
import {AcceptedTagsMap} from "../spec/react";

export interface AppOptions<K extends keyof AcceptedTagsMap> extends TagOptions<K> {
    debugUi ?: boolean
}

/**
 * Application Node
 * @class AppNode
 * @extends INode
 */
export class AppNode<T extends AppOptions<any> = AppOptions<any>> extends INode<T> {
    /**
     * Enables debug comments
     */
    debugUi : boolean;

    /**
     * @param input
     */
    constructor (input : T) {
        super(input);
        this.debugUi = input.debugUi || false;
        this.seal();
    }
}

/**
 * Represents a Vasille.js application
 * @class App
 * @extends AppNode
 */
export class App<T extends AppOptions<any> = AppOptions<any>> extends AppNode<T> {
    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param input
     */
    constructor (node : Element, input : T) {
        super(input);

        this.$.node = node;
        this.preinit(this, this);
        this.init();

        this.seal();
    }

    public appendNode (node : Node) {
        this.$.node.appendChild(node);
    }
}

interface PortalOptions extends AppOptions<'div'> {
    node : Element
    slot ?: (node : Fragment) => void
}

export class Portal extends AppNode<PortalOptions> {
    constructor (input : PortalOptions) {
        super(input);

        this.$.node = input.node;

        this.seal();
    }

    public appendNode (node : Node) {
        this.$.node.appendChild(node);
    }
}
