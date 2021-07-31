// @flow

import { IValue } from "../index";



/**
 * Represent a function encapsulated to a class
 */
export class Callable {
    /**
     * Function which will resolve value
     * @type {Function}
     */
    func : Function;

    /**
     * Encapsulates a function
     * @param func {Function} function to encapsulate
     */
    constructor (func : Function) {
        Object.defineProperty(this, 'func', {
            value: func,
            writable: false,
            configurable: false
        });
    }
}

/**
 * Check the type of value
 * @param v {*} value
 * @param t {Function} type constructor
 * @return {boolean}
 */
export function checkType (v : any, t : Function) : boolean {
    if (v instanceof IValue) {
        v = v.$;
    }
    return (v instanceof t) || v === null ||
        (typeof v === "number" && t === Number) ||
        (typeof v === "string" && t === String) ||
        (typeof v === "boolean" && t === Boolean);
}

/**
 * Check if a type is a subtype
 * @param parent {Function} potential superclass
 * @param child {Function} potential subclass
 * @return {boolean}
 */
export function isSubclassOf (parent : Function, child : Function) : boolean {
    let it : Function = child;
    let isParent = false;

    while (it && !isParent) {
        isParent = it.prototype instanceof parent;
        it = it.prototype;
    }

    return isParent;
}
