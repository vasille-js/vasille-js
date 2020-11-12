// @flow
import { IValue } from "./ivalue.js";



/**
 * Mark an object which can be bound
 * @interface
 */
export class IBind extends IValue {
    /**
     * Ensure the binding to be bound
     * @return a pointer to this
     * @throws must be overwritten
     */
    link () : IBind {
        throw "Must be overwritten";
    }

    /**
     * Ensure the binding to be unbound
     * @return a pointer to this
     * @throws must be overwritten
     */
    unlink () : IBind {
        throw "Must be overwritten";
    }
}
