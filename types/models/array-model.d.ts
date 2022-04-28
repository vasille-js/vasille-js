import { Listener } from "./listener";
import { ListenableModel } from "./model";
/**
 * Model based on Array class
 * @extends Array
 * @implements IModel
 */
export declare class ArrayModel<T> extends Array<T> implements ListenableModel<T, T> {
    listener: Listener<T, T>;
    /**
     * @param data {Array} input data
     */
    constructor(data?: Array<T>);
    proxy(): ArrayModel<T>;
    /**
     * Gets the last item of array
     * @return {*} the last item of array
     */
    get last(): T;
    /**
     * Calls Array.fill and notify about changes
     * @param value {*} value to fill with
     * @param start {?number} begin index
     * @param end {?number} end index
     */
    fill(value: T, start?: number, end?: number): this;
    /**
     * Calls Array.pop and notify about changes
     * @return {*} removed value
     */
    pop(): T;
    /**
     * Calls Array.push and notify about changes
     * @param items {...*} values to push
     * @return {number} new length of array
     */
    push(...items: Array<T>): number;
    /**
     * Calls Array.shift and notify about changed
     * @return {*} the shifted value
     */
    shift(): T;
    /**
     * Calls Array.splice and notify about changed
     * @param start {number} start index
     * @param deleteCount {?number} delete count
     * @param items {...*}
     * @return {ArrayModel} a pointer to this
     */
    splice(start: number, deleteCount?: number, ...items: Array<T>): ArrayModel<T>;
    /**
     * Calls Array.unshift and notify about changed
     * @param items {...*} values to insert
     * @return {number} the length after prepend
     */
    unshift(...items: Array<T>): number;
    /**
     * Inserts a value to the end of array
     * @param v {*} value to insert
     */
    append(v: T): this;
    /**
     * Clears array
     * @return {this} a pointer to this
     */
    clear(): this;
    /**
     * Inserts a value to position `index`
     * @param index {number} index to insert value
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    insert(index: number, v: T): this;
    /**
     * Inserts a value to the beginning of array
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    prepend(v: T): this;
    /**
     * Removes a value from an index
     * @param index {number} index of value to remove
     * @return {this} a pointer to this
     */
    removeAt(index: number): this;
    /**
     * Removes the first value of array
     * @return {this} a pointer to this
     */
    removeFirst(): this;
    /**
     * Removes the ast value of array
     * @return {this} a pointer to this
     */
    removeLast(): this;
    /**
     * Remove the first occurrence of value
     * @param v {*} value to remove
     * @return {this}
     */
    removeOne(v: T): this;
    enableReactivity(): void;
    disableReactivity(): void;
}
