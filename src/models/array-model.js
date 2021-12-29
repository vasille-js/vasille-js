// @flow
import { Listener } from "./listener";
import type { IModel } from "./model";



/**
 * Model based on Array class
 * @extends Array<IValue>
 */
export class ArrayModel<T> extends Array<T> implements IModel {
    /**
     * Listener of array model
     * @type {Listener}
     */
    listener : Listener<T, ?T>;

    /* Constructor */

    /**
     * Constructs an array model from an array
     * @param data {Array<IValue>} input data
     */
    constructor (data : Array<T> = []) {
        super();

        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            customisable: false
        });

        for (let i = 0; i < data.length; i++) {
            super.push(data[i]);
        }
    }

    /* Array members */

    /**
     * Gets the last value of array and null when it is empty
     * @return {?IValue}
     */
    get last () : ?T {
        return this.length ? this[this.length - 1] : null;
    }

    /**
     * Calls Array.fill and notify about changes
     * @param value {*} value to fill with
     * @param start {?number} begin index
     * @param end {?number} end index
     * @return {ArrayModel} a pointer to this
     */
    fill (value : T, start : ?number, end : ?number) : this {
        if (!start) {
            start = 0;
        }
        if (!end) {
            end = this.length;
        }

        for (let i = start; i < end; i++) {
            this.listener.emitRemoved(this[i], this[i]);
            this[i] = value;
            this.listener.emitAdded(value, value);
        }
        return this;
    }

    /**
     * Calls Array.pop and notify about changes
     * @return {IValue} removed value
     */
    pop () : T {
        let v = super.pop();

        if (v) {
            this.listener.emitRemoved(v, v);
        }
        return v;
    }

    /**
     * Calls Array.push and notify about changes
     * @param items {...IValue} values to push
     * @return {number} new length of array
     */
    push (...items : Array<T>) : number {
        for (let item of items) {

            this.listener.emitAdded(item, item);
            super.push(item);
        }
        return this.length;
    }

    /**
     * Calls Array.shift and notify about changed
     * @return {IValue} the shifted value
     */
    shift () : T {
        let v = super.shift();

        if (v) {
            this.listener.emitRemoved(v, v);
        }
        return v;
    }

    /**
     * Calls Array.splice and notify about changed
     * @param start {number} start index
     * @param deleteCount {?number} delete count
     * @param items {...IValue}
     * @return {ArrayModel} a pointer to this
     */
    splice (
        start : number,
        deleteCount : ?number,
        ...items : Array<T>
    ) : ArrayModel<T> {
        start = Math.min(start, this.length);
        deleteCount = deleteCount || this.length - start;

        for (let i = 0; i < deleteCount; i++) {
            let index = start + deleteCount - i - 1;
            if (this[index] !== undefined) {
                this.listener.emitRemoved(this[index], this[index]);
            }
        }
        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded(this[start + i], items[i]);
        }

        return new ArrayModel<T>(super.splice(start, deleteCount, ...items));
    }

    /* Vasile.js array interface */

    /**
     * Calls Array.unshift and notify about changed
     * @param items {...IValue} values to insert
     * @return {number | void} the length after prepend
     */
    unshift (...items : Array<T>) : number {

        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded(this[i], items[i]);
        }
        return super.unshift(...items);
    }

    /**
     * Inserts a value to the end of array
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    append (v : T) : this {
        this.listener.emitAdded(null, v);
        super.push(v);
        return this;
    }

    /**
     * Clears array
     * @return {this} a pointer to this
     */
    clear () : this {
        for (let v of this) {
            this.listener.emitRemoved(v, v);
        }
        super.splice(0);
        return this;
    }

    /**
     * Inserts a value to position <i>index</i>
     * @param index {number} index to insert value
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    insert (index : number, v : T) : this {
        this.listener.emitAdded(v, v);
        super.splice(index, 0, v);
        return this;
    }

    /**
     * Inserts a value to the beginning of array
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    prepend (v : T) : this {
        this.listener.emitAdded(v, v);
        super.unshift(v);
        return this;
    }

    /**
     * Removes a value from an index
     * @param index {number} index of value to remove
     * @return {this} a pointer to this
     */
    removeAt (index : number) : this {
        if (index > 0 && index < this.length) {
            this.listener.emitRemoved(this[index], this[index]);
            super.splice(index, 1);
        }
        return this;
    }

    /**
     * Removes the first value of array
     * @return {this} a pointer to this
     */
    removeFirst () : this {
        if (this.length) {
            this.listener.emitRemoved(this[0], this[0]);
            super.shift();
        }
        return this;
    }

    /**
     * Removes the ast value of array
     * @return {this} a pointer to this
     */
    removeLast () : this {
        const last = this.last;

        if (last) {
            this.listener.emitRemoved(this[this.length - 1], last);
            super.pop();
        }
        return this;
    }

    /**
     * Remove the first occurrence of value
     * @param v {IValue} value to remove
     * @return {this}
     */
    removeOne (v : T) : this {
        this.removeAt(this.indexOf(v));
        return this;
    }

    enableReactivity () {
        this.listener.enableReactivity();
    }

    disableReactivity () {
        this.listener.disableReactivity();
    }
}

