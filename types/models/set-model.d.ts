import { Listener } from "./listener";
import { ListenableModel } from "./model";
/**
 * A Set based model
 * @class SetModel
 * @extends Set
 * @implements IModel
 */
export declare class SetModel<T> extends Set<T> implements ListenableModel<T, T> {
    listener: Listener<T, T>;
    /**
     * Constructs a set model based on a set
     * @param set {Set} input data
     */
    constructor(set?: T[]);
    /**
     * Calls Set.add and notify abut changes
     * @param value {*} value
     * @return {this} a pointer to this
     */
    add(value: T): this;
    /**
     * Calls Set.clear and notify abut changes
     */
    clear(): void;
    /**
     * Calls Set.delete and notify abut changes
     * @param value {*}
     * @return {boolean} true if a value was deleted, otherwise false
     */
    delete(value: T): boolean;
    enableReactivity(): void;
    disableReactivity(): void;
}
