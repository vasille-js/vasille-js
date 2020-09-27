// @flow
import type {IValue} from "./ivalue";
import type {Destroyable} from "./destroyable";



/**
 * Mark an object which can be bound
 */
export interface IBind extends IValue, Destroyable {
    link () : IBind;
    unlink () : IBind;
}
