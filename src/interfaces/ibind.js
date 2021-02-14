// @flow
import { notOverwritten } from "./errors";
import { IValue }         from "./ivalue.js";



/**
 * Mark an object which can be bound
 * @interface
 */
export class IBind extends IValue<any> {
    /**
     * Ensure the binding to be bound
     * @return a pointer to this
     * @throws must be overwritten
     */
    link () : this {
        throw notOverwritten();
    }

    /**
     * Ensure the binding to be unbound
     * @return a pointer to this
     * @throws must be overwritten
     */
    unlink () : this {
        throw notOverwritten();
    }
}
