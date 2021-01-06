// @flow

import { IValue } from "../index";



/**
 * Represent a function encapsulated to a class
 */
export class Callable {
    func : Function;

    /**
     * Encapsulates a function
     * @param func {Function} function to encapsulate
     */
    constructor (func : Function) {
        this.func = func;
    }
}

export function checkType (v : any, t : Function) : boolean {
    if (v instanceof IValue) {
        v = v.$;
    }
    return (v instanceof t) || v === null ||
        (typeof v === "number" && t === Number) ||
        (typeof v === "string" && t === String) ||
        (typeof v === "boolean" && t === Boolean);
}

export function isSubclassOf (parent : Function, child : Function) : boolean {
    let it : Function = child;
    let isParent = false;

    while (it && !isParent) {
        isParent = it.prototype instanceof parent;
        it = it.__proto__;
    }

    return isParent;
}
