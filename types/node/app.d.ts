import { Fragment, INode } from "./node";
import { TagOptions } from "../functional/options";
import { AcceptedTagsMap } from "../spec/react";
export interface AppOptions<K extends keyof AcceptedTagsMap> extends TagOptions<K> {
    debugUi?: boolean;
}
/**
 * Application Node
 * @class AppNode
 * @extends INode
 */
export declare class AppNode<T extends AppOptions<any> = AppOptions<any>> extends INode<T> {
    /**
     * Enables debug comments
     */
    debugUi: boolean;
    /**
     * @param input
     */
    constructor(input: T);
}
/**
 * Represents a Vasille.js application
 * @class App
 * @extends AppNode
 */
export declare class App<T extends AppOptions<any> = AppOptions<any>> extends AppNode<T> {
    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param input
     */
    constructor(node: Element, input: T);
    appendNode(node: Node): void;
}
interface PortalOptions extends AppOptions<'div'> {
    node: Element;
    slot?: (node: Fragment) => void;
}
export declare class Portal extends AppNode<PortalOptions> {
    constructor(input: PortalOptions);
    appendNode(node: Node): void;
}
export {};
