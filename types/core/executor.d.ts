/**
 * Represents an executor unit interface
 * @class Executor
 */
export declare class Executor {
    /**
     * Adds a CSS class
     * @param el {Element} element to manipulate
     * @param cl {string} class to be added
     */
    addClass(el: Element, cl: string): void;
    /**
     * Removes a CSS class
     * @param el {Element} element to manipulate
     * @param cl {string} class to be removed
     */
    removeClass(el: Element, cl: string): void;
    /**
     * Sets a tag attribute
     * @param el {Element} element to manipulate
     * @param name {string} name of attribute
     * @param value {string} value of attribute
     */
    setAttribute(el: Element, name: string, value: string): void;
    /**
     * Removes a tag attribute
     * @param el {Element} element to manipulate
     * @param name {string} name of attribute
     */
    removeAttribute(el: Element, name: string): void;
    /**
     * Sets a style attribute
     * @param el {HTMLElement} element to manipulate
     * @param prop {string} property name
     * @param value {string} property value
     */
    setStyle(el: HTMLElement, prop: string, value: string): void;
    /**
     * Inserts a child before target
     * @param target {Element} target element
     * @param child {Node} element to insert before
     */
    insertBefore(target: Node, child: Node): void;
    /**
     * Appends a child to element
     * @param el {Element} element
     * @param child {Node} child to be inserted
     */
    appendChild(el: Element, child: Node): void;
    /**
     * Calls a call-back function
     * @param cb {function} call-back function
     */
    callCallback(cb: () => void): void;
}
/**
 * Executor which execute any commands immediately
 * @class InstantExecutor
 * @extends Executor
 */
export declare class InstantExecutor extends Executor {
    addClass(el: Element, cl: string): void;
    removeClass(el: Element, cl: string): void;
    setAttribute(el: Element, name: string, value: string): void;
    removeAttribute(el: Element, name: string): void;
    setStyle(el: HTMLElement, prop: string, value: string): void;
    insertBefore(target: Node, child: Node): void;
    appendChild(el: Node, child: Node): void;
    callCallback(cb: () => void): void;
}
/**
 * Executor which execute any commands over timeout
 * @class TimeoutExecutor
 * @extends InstantExecutor
 */
export declare class TimeoutExecutor extends InstantExecutor {
    addClass(el: Element, cl: string): void;
    removeClass(el: Element, cl: string): void;
    setAttribute(el: Element, name: string, value: string): void;
    removeAttribute(el: Element, name: string): void;
    setStyle(el: HTMLElement, prop: string, value: string): void;
    insertBefore(target: Node, child: Node): void;
    appendChild(el: Node, child: Node): void;
    callCallback(cb: () => void): void;
}
export declare const instantExecutor: InstantExecutor;
export declare const timeoutExecutor: TimeoutExecutor;
