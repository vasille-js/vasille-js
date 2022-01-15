import { Fragment } from "../node/node";
/**
 * Component slot
 * @class Slot
 */
export declare class Slot<t extends Fragment = Fragment, t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void> {
    /**
     * Function to run
     * @type {function(node : Fragment)}
     */
    private runner?;
    /**
     * Sets the runner
     * @param func {function} the function to run
     */
    insert(func: (a0: t, a1: t1, a2: t2, a3: t3, a4: t4, a5: t5, a6: t6, a7: t7, a8: t8, a9: t9) => void): void;
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
    release(a0: t, a1: t1, a2: t2, a3: t3, a4: t4, a5: t5, a6: t6, a7: t7, a8: t8, a9: t9): void;
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
    predefine(func: (a0: t, a1: t1, a2: t2, a3: t3, a4: t4, a5: t5, a6: t6, a7: t7, a8: t8, a9: t9) => void, a0: t, a1: t1, a2: t2, a3: t3, a4: t4, a5: t5, a6: t6, a7: t7, a8: t8, a9: t9): void;
}
