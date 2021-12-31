import { Executor } from "../core/executor";
import { INode } from "./node";
declare type AppOptions = {
    freezeUi: boolean;
    executor: Executor;
};
/**
 * Application Node
 * @class AppNode
 * @extends INode
 */
export declare class AppNode extends INode {
    /**
     * Executor is used to optimize the page creation/update
     * @type {Executor}
     */
    $run: Executor;
    /**
     * @param options {Object} Application options
     */
    constructor(options?: AppOptions);
}
/**
 * Represents a Vasille.js application
 * @class App
 * @extends AppNode
 */
export declare class App extends AppNode {
    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param options {Object} Application options
     */
    constructor(node: Element, options?: AppOptions);
}
export {};
