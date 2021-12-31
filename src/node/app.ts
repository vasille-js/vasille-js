import { Executor, instantExecutor, timeoutExecutor } from "../core/executor";
import { INode } from "./node";

type AppOptions = {
    freezeUi : boolean,
    executor : Executor
};

/**
 * Application Node
 * @class AppNode
 * @extends INode
 */
export class AppNode extends INode {
    /**
     * Executor is used to optimize the page creation/update
     * @type {Executor}
     */
    $run : Executor;

    /**
     * @param options {Object} Application options
     */
    constructor (options ?: AppOptions) {
        super ();

        this.$run = options?.executor || options?.freezeUi === false ? timeoutExecutor : instantExecutor;
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
        this.$preinit(this, this);

        this.$seal();
    }
}
