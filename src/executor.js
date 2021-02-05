// @flow
import { notOverwritten } from "./interfaces/errors";



/**
 * Represents an executor unit interface
 */
export class Executor {

    /**
     * Adds a CSS class
     * @param el {HTMLElement} HTML element
     * @param cl {string}
     */
    addClass (el : HTMLElement, cl : string) {
        throw notOverwritten();
    }

    /**
     * Removes a CSS class
     * @param el {HTMLElement} HTML element
     * @param cl {string}
     */
    removeClass (el : HTMLElement, cl : string) {
        throw notOverwritten();
    }

    /**
     * Sets a tag attribute
     * @param el {HTMLElement} HTML element
     * @param name {string}
     * @param value {string}
     */
    setAttribute (el : HTMLElement, name : string, value : string) {
        throw notOverwritten();
    }

    /**
     * Removes a tag attribute
     * @param el {HTMLElement} HTML element
     * @param name {string}
     */
    removeAttribute (el : HTMLElement, name : string) {
        throw notOverwritten();
    }

    /**
     * Sets a style attribute
     * @param el {HTMLElement} HTML element
     * @param prop {string}
     * @param value {string}
     */
    setStyle (el : HTMLElement, prop : string, value : string) {
        throw notOverwritten();
    }

    /**
     * Inserts a child
     * @param el {HTMLElement} HTML element
     * @param child {HTMLElement | Text | Comment} Child to insert
     * @param before {HTMLElement | Text | Comment} Child used as position locator
     */
    insertBefore (el : HTMLElement, child : HTMLElement | Text | Comment, before : HTMLElement | Text | Comment) {
        throw notOverwritten();
    }

    /**
     * Appends a child
     * @param el {HTMLElement} HTML element
     * @param child {HTMLElement | Text | Comment} Child to append
     */
    appendChild (el : HTMLElement, child : HTMLElement | Text | Comment) {
        throw notOverwritten();
    }

    /**
     * Calls a call-back function
     * @param cb {Function} call-back function
     */
    callCallback (cb : Function) {
        throw notOverwritten();
    }
}

export class InstantExecutor extends Executor {

    log : ?Array<Object>;

    /**
     * Adds a CSS class
     * @param el {HTMLElement} HTML element
     * @param cl {string}
     */
    addClass (el : HTMLElement, cl : string) {
        if (el) {
            el.classList.add(cl);
        }
    }

    /**
     * Removes a CSS class
     * @param el {HTMLElement} HTML element
     * @param cl {string}
     */
    removeClass (el : HTMLElement, cl : string) {
        if (el) {
            el.classList.remove(cl);
        }
    }

    /**
     * Sets a tag attribute
     * @param el {HTMLElement} HTML element
     * @param name {string}
     * @param value {string}
     */
    setAttribute (el : HTMLElement, name : string, value : string) {
        el.setAttribute(name, value);
    }

    /**
     * Removes a tag attribute
     * @param el {HTMLElement} HTML element
     * @param name {string}
     */
    removeAttribute (el : HTMLElement, name : string) {
        el.removeAttribute(name);
    }

    /**
     * Sets a style attribute
     * @param el {HTMLElement} HTML element
     * @param prop {string}
     * @param value {string}
     */
    setStyle (el : HTMLElement, prop : string, value : string) {
        el.style.setProperty(prop, value);
    }

    /**
     * Inserts a child
     * @param el {HTMLElement} HTML element
     * @param child {HTMLElement | Text | Comment} Child to insert
     * @param before {HTMLElement | Text | Comment} Child used as position locator
     */
    insertBefore (el : HTMLElement, child : HTMLElement | Text | Comment, before : HTMLElement | Text | Comment) {
        el.insertBefore(child, before);
    }

    /**
     * Appends a child
     * @param el {HTMLElement} HTML element
     * @param child {HTMLElement | Text | Comment} Child to append
     */
    appendChild (el : HTMLElement, child : HTMLElement | Text | Comment) {
        el.appendChild(child);
    }

    /**
     * Calls a call-back function
     * @param cb {Function} call-back function
     */
    callCallback (cb : Function) {
        cb();
    }
}
