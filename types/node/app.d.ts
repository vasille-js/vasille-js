import { INode } from "./node";
interface AppOptions {
    debugUi?: boolean;
}
/**
 * Application Node
 * @class AppNode
 * @extends INode
 */
export declare class AppNode extends INode {
    /**
     * Enables debug comments
     */
    debugUi: boolean;
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
    appendNode(node: Node): void;
}
export {};
