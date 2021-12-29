// @flow
import { Fragment } from "../node/node";

/**
 * Defines a component slot
 */
export class Slot<
    t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void
    > {
    /**
     * Function to run
     * @type {?(function(INode, t1, t2, t3, t4, t5, t6, t7, t8, t9) : void)}
     */
    runner : ?(a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void;

    /**
     * Sets the insert handler
     * @param func {Function} Function to run
     */
    insert (
        func : (a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void
    ) {
        this.runner = func;
    }

    /**
     * @param a0 {INode} node to paste content
     * @param a1 {*} 1st argument
     * @param a2 {*} 2nd argument
     * @param a3 {*} 3rd argument
     * @param a4 {*} 4th argument
     * @param a5 {*} 5th argument
     * @param a6 {*} 6th argument
     * @param a7 {*} 7th argument
     * @param a8 {*} 8th argument
     * @param a9 {*} 9th argument
     */
    release (
        a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9
    ) {
        if (this.runner) {
            this.runner (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
        }
    }

    /**
     * Predefine a handler for a slot
     * @param func {Function} Function to run if no handler specified
     * @param a0 {INode} node to paste content
     * @param a1 {*} 1st argument
     * @param a2 {*} 2nd argument
     * @param a3 {*} 3rd argument
     * @param a4 {*} 4th argument
     * @param a5 {*} 5th argument
     * @param a6 {*} 6th argument
     * @param a7 {*} 7th argument
     * @param a8 {*} 8th argument
     * @param a9 {*} 9th argument
     */
    predefine (
        func : (a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void,
        a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9
    ) {
        (this.runner || func) (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    }
}
