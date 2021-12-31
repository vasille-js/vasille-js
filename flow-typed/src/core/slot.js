// @flow
import { Fragment } from "../node/node";

/**
 * Defines a component slot
 */
declare export class Slot<
    t1 = void, t2 = void, t3 = void, t4 = void, t5 = void, t6 = void, t7 = void, t8 = void, t9 = void
    > {
    runner : ?(a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void;

    insert (
        func : (a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void
    ) : void;
    release (
        a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9
    ) : void;
    predefine (
        func : (a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9) => void,
        a0 : Fragment, a1 : t1, a2 : t2, a3 : t3, a4 : t4, a5 : t5, a6 : t6, a7 : t7, a8 : t8, a9 : t9
    ) : void;
}
