// @flow

import { Executor, instantExecutor, timeoutExecutor } from "../core/executor";
import { INode } from "./node";

type AppOptions = {
    freezeUi : boolean,
    executor : Executor
};

export class AppNode extends INode {
    /**
     * Executor is used to optimize the page creation/update
     * @type {Executor}
     */
    $run : Executor;

    constructor (options ?: AppOptions) {
        super ();

        this.$run = options?.executor || options?.freezeUi === false ? timeoutExecutor : instantExecutor;
    }
}

/**
 * Represents a Vasille.js application node
 */
export class App extends AppNode {
    /**
     * Constructs an app node
     * @param node {HTMLElement} The root of application
     */
    constructor (node : HTMLElement, options ?: AppOptions) {
        super(options);

        this.$.node = node;
        this.$preinit(this, this);

        this.$seal();
    }
}
