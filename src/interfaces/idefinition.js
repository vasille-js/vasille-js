// @flow

/**
 * Represent a function encapsulated to a class
 */
export class Callable {
    func : Function;

    /**
     * Encapsulates a function with signature ```(rt : BaseNode, ts : BaseNode) : void```
     * @param func {Function} function to encapsulate
     */
    constructor (func : Function) {
        this.func = func;
    }
}
