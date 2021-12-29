// @flow
import { internalError, notOverwritten } from "./errors";



/**
 * Represents an executor unit interface
 */
export class Executor {

    /**
     * Adds a CSS class
     * @param el {HTMLElement} HTML element
     * @param cl {string}
     */
    addClass (el : Element, cl : string) : void {
        throw notOverwritten();
    }

    /**
     * Removes a CSS class
     * @param el {HTMLElement} HTML element
     * @param cl {string}
     */
    removeClass (el : Element, cl : string) : void {
        throw notOverwritten();
    }

    /**
     * Sets a tag attribute
     * @param el {HTMLElement} HTML element
     * @param name {string}
     * @param value {string}
     */
    setAttribute (el : Element, name : string, value : string) : void {
        throw notOverwritten();
    }

    /**
     * Removes a tag attribute
     * @param el {HTMLElement} HTML element
     * @param name {string}
     */
    removeAttribute (el : Element, name : string) : void {
        throw notOverwritten();
    }

    /**
     * Sets a style attribute
     * @param el {HTMLElement} HTML element
     * @param prop {string}
     * @param value {string}
     */
    setStyle (el : HTMLElement, prop : string, value : string) : void {
        throw notOverwritten();
    }

    /**
     * Inserts a child
     * @param el {HTMLElement} HTML element
     * @param child {HTMLElement | Text | Comment} Child to insert
     * @param before {HTMLElement | Text | Comment} Child used as position locator
     */
    insertBefore (target : Element, child : Node) : void {
        throw notOverwritten();
    }

    /**
     * Appends a child
     * @param el {HTMLElement} HTML element
     * @param child {HTMLElement | Text | Comment} Child to append
     */
    appendChild (el : Element, child : Node) : void {
        throw notOverwritten();
    }

    /**
     * Calls a call-back function
     * @param cb {Function} call-back function
     */
    callCallback (cb : () => void) : void {
        throw notOverwritten();
    }
}

export class InstantExecutor extends Executor {

    addClass (el : Element, cl : string) {
        el.classList.add(cl);
    }

    removeClass (el : Element, cl : string) {
        el.classList.remove(cl);
    }

    setAttribute (el : Element, name : string, value : string) {
        el.setAttribute(name, value);
    }

    removeAttribute (el : Element, name : string) {
        el.removeAttribute(name);
    }

    setStyle (el : HTMLElement, prop : string, value : string) {
        el.style.setProperty(prop, value);
    }

    insertBefore (target : Node, child : Node) {
        let parent = target.parentNode;

        if (!parent) {
            throw internalError('element don\'t have a parent node');
        }

        parent.insertBefore(child, target);
    }

    appendChild (el : Node, child : Node) {
        el.appendChild(child);
    }

    callCallback (cb : () => void) {
        cb();
    }
}

export class TimeoutExecutor extends InstantExecutor {

    addClass (el : Element, cl : string) {
        setTimeout(() => {
            super.addClass (el, cl);
        }, 0);
    }

    removeClass (el : Element, cl : string) {
        setTimeout(() => {
            super.removeClass (el, cl);
        }, 0);
    }

    setAttribute (el : Element, name : string, value : string) {
        setTimeout(() => {
            super.setAttribute (el, name, value);
        }, 0);
    }

    removeAttribute (el : Element, name : string) {
        setTimeout(() => {
            super.removeAttribute (el, name);
        }, 0);
    }

    setStyle (el : HTMLElement, prop : string, value : string) {
        setTimeout(() => {
            super.setStyle (el, prop, value);
        }, 0);
    }

    insertBefore (target : Node, child : Node) {
        setTimeout(() => {
            super.insertBefore (target, child);
        }, 0);
    }

    appendChild (el : Node, child : Node) {
        setTimeout(() => {
            super.appendChild (el, child);
        }, 0);
    }

    callCallback (cb : () => void) {
        setTimeout(cb, 0);
    }
}

export const instantExecutor : InstantExecutor = new InstantExecutor();
export const timeoutExecutor : TimeoutExecutor = new TimeoutExecutor();
