import { Listener } from "./listener";
import type { IModel } from "./model";
/**
 * Object based model
 * @extends Object
 */
export declare class ObjectModel<T> extends Object implements IModel<string, T> {
    listener: Listener<T, string>;
    /**
     * Constructs a object model
     * @param obj {Object} input data
     */
    constructor(obj?: {
        [p: string]: T;
    });
    /**
     * Gets a value of a field
     * @param key {string}
     * @return {*}
     */
    get(key: string): T;
    /**
     * Sets an object property value
     * @param key {string} property name
     * @param v {*} property value
     * @return {ObjectModel} a pointer to this
     */
    set(key: string, v: T): this;
    /**
     * Deletes an object property
     * @param key {string} property name
     */
    delete(key: string): void;
    enableReactivity(): void;
    disableReactivity(): void;
}
