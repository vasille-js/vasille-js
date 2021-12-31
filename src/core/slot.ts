import { Fragment } from "../node/node";

/**
 * Component slot
 * @class Slot
 */
export class Slot<
    t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void
    > {

    /**
     * Function to run
     * @type {function(node : Fragment)}
     */
    private runner ?:
        (a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void;

    /**
     * Sets the runner
     * @param func {function} the function to run
     */
    public insert (
        func : (a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void
    ) {
        this.runner = func;
    }

    /**
     * @param a0 {Fragment} node to paste content
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
    public release (
        a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9
    ) {
        if (this.runner) {
            this.runner (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
        }
    }

    /**
     * Predefine a handler for a slot
     * @param func {function(node : Fragment)} Function to run if no handler specified
     * @param a0 {Fragment} node to paste content
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
    public predefine (
        func : (a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void,
        a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9
    ) {
        (this.runner || func) (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    }
}
