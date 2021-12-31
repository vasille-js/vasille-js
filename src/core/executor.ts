import { internalError, notOverwritten } from "./errors";



/**
 * Represents an executor unit interface
 * @class Executor
 */
export class Executor {

    /**
     * Adds a CSS class
     * @param el {Element} element to manipulate
     * @param cl {string} class to be added
     */
    public addClass (el : Element, cl : string) : void {
        throw notOverwritten();
    }

    /**
     * Removes a CSS class
     * @param el {Element} element to manipulate
     * @param cl {string} class to be removed
     */
    public removeClass (el : Element, cl : string) : void {
        throw notOverwritten();
    }

    /**
     * Sets a tag attribute
     * @param el {Element} element to manipulate
     * @param name {string} name of attribute
     * @param value {string} value of attribute
     */
    public setAttribute (el : Element, name : string, value : string) : void {
        throw notOverwritten();
    }

    /**
     * Removes a tag attribute
     * @param el {Element} element to manipulate
     * @param name {string} name of attribute
     */
    public removeAttribute (el : Element, name : string) : void {
        throw notOverwritten();
    }

    /**
     * Sets a style attribute
     * @param el {HTMLElement} element to manipulate
     * @param prop {string} property name
     * @param value {string} property value
     */
    public setStyle (el : HTMLElement, prop : string, value : string) : void {
        throw notOverwritten();
    }

    /**
     * Inserts a child before target
     * @param target {Element} target element
     * @param child {Node} element to insert before
     */
    public insertBefore (target : Element, child : Node) : void {
        throw notOverwritten();
    }

    /**
     * Appends a child to element
     * @param el {Element} element
     * @param child {Node} child to be inserted
     */
    public appendChild (el : Element, child : Node) : void {
        throw notOverwritten();
    }

    /**
     * Calls a call-back function
     * @param cb {function} call-back function
     */
    public callCallback (cb : () => void) : void {
        throw notOverwritten();
    }
}

/**
 * Executor which execute any commands immediately
 * @class InstantExecutor
 * @extends Executor
 */
export class InstantExecutor extends Executor {

    public addClass (el : Element, cl : string) {
        el.classList.add(cl);
    }

    public removeClass (el : Element, cl : string) {
        el.classList.remove(cl);
    }

    public setAttribute (el : Element, name : string, value : string) {
        el.setAttribute(name, value);
    }

    public removeAttribute (el : Element, name : string) {
        el.removeAttribute(name);
    }

    public setStyle (el : HTMLElement, prop : string, value : string) {
        el.style.setProperty(prop, value);
    }

    public insertBefore (target : Node, child : Node) {
        let parent = target.parentNode;

        if (!parent) {
            throw internalError('element don\'t have a parent node');
        }

        parent.insertBefore(child, target);
    }

    public appendChild (el : Node, child : Node) {
        el.appendChild(child);
    }

    public callCallback (cb : () => void) {
        cb();
    }
}

/**
 * Executor which execute any commands over timeout
 * @class TimeoutExecutor
 * @extends InstantExecutor
 */
export class TimeoutExecutor extends InstantExecutor {

    public addClass (el : Element, cl : string) {
        setTimeout(() => {
            super.addClass (el, cl);
        }, 0);
    }

    public removeClass (el : Element, cl : string) {
        setTimeout(() => {
            super.removeClass (el, cl);
        }, 0);
    }

    public setAttribute (el : Element, name : string, value : string) {
        setTimeout(() => {
            super.setAttribute (el, name, value);
        }, 0);
    }

    public removeAttribute (el : Element, name : string) {
        setTimeout(() => {
            super.removeAttribute (el, name);
        }, 0);
    }

    public setStyle (el : HTMLElement, prop : string, value : string) {
        setTimeout(() => {
            super.setStyle (el, prop, value);
        }, 0);
    }

    public insertBefore (target : Node, child : Node) {
        setTimeout(() => {
            super.insertBefore (target, child);
        }, 0);
    }

    public appendChild (el : Node, child : Node) {
        setTimeout(() => {
            super.appendChild (el, child);
        }, 0);
    }

    public callCallback (cb : () => void) {
        setTimeout(cb, 0);
    }
}

export const instantExecutor : InstantExecutor = new InstantExecutor();
export const timeoutExecutor : TimeoutExecutor = new TimeoutExecutor();
