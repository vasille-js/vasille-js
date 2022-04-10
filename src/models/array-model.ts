import { Listener } from "./listener";
import { ListenableModel } from "./model";



/**
 * Model based on Array class
 * @extends Array
 * @implements IModel
 */
export class ArrayModel<T> extends Array<T> implements ListenableModel<T, T> {

    public listener : Listener<T, T>;

    /**
     * @param data {Array} input data
     */
    public constructor (data : Array<T> = []) {
        super();

        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });

        for (let i = 0; i < data.length; i++) {
            super.push(data[i]);
        }
    }

    /* Array members */

    /**
     * Gets the last item of array
     * @return {*} the last item of array
     */
    public get last () : T {
        return this.length ? this[this.length - 1] : null;
    }

    /**
     * Calls Array.fill and notify about changes
     * @param value {*} value to fill with
     * @param start {?number} begin index
     * @param end {?number} end index
     */
    public fill (value : T, start ?: number, end ?: number) : this {
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
     * @return {*} removed value
     */
    public pop () : T {
        const v = super.pop();

        if (v !== undefined) {
            this.listener.emitRemoved(v, v);
        }
        return v;
    }

    /**
     * Calls Array.push and notify about changes
     * @param items {...*} values to push
     * @return {number} new length of array
     */
    public push (...items : Array<T>) : number {
        items.forEach(item => {

            this.listener.emitAdded(item, item);
            super.push(item);
        });
        return this.length;
    }

    /**
     * Calls Array.shift and notify about changed
     * @return {*} the shifted value
     */
    public shift () : T {
        const v = super.shift();

        if (v !== undefined) {
            this.listener.emitRemoved(v, v);
        }
        return v;
    }

    /**
     * Calls Array.splice and notify about changed
     * @param start {number} start index
     * @param deleteCount {?number} delete count
     * @param items {...*}
     * @return {ArrayModel} a pointer to this
     */
    public splice (
        start : number,
        deleteCount ?: number,
        ...items : Array<T>
    ) : ArrayModel<T> {
        start = Math.min(start, this.length);
        deleteCount = deleteCount || this.length - start;

        const before = this[start + deleteCount];

        for (let i = 0; i < deleteCount; i++) {
            const index = start + deleteCount - i - 1;
            if (this[index] !== undefined) {
                this.listener.emitRemoved(this[index], this[index]);
            }
        }
        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded(before, items[i]);
        }

        return new ArrayModel<T>(super.splice(start, deleteCount, ...items));
    }

    /**
     * Calls Array.unshift and notify about changed
     * @param items {...*} values to insert
     * @return {number} the length after prepend
     */
    public unshift (...items : Array<T>) : number {

        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded(this[i], items[i]);
        }
        return super.unshift(...items);
    }

    /**
     * Inserts a value to the end of array
     * @param v {*} value to insert
     */
    public append (v : T) : this {
        this.listener.emitAdded(null, v);
        super.push(v);
        return this;
    }

    /**
     * Clears array
     * @return {this} a pointer to this
     */
    public clear () : this {
        this.forEach(v => {
            this.listener.emitRemoved(v, v);
        });
        super.splice(0);
        return this;
    }

    /**
     * Inserts a value to position `index`
     * @param index {number} index to insert value
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    public insert (index : number, v : T) : this {
        this.listener.emitAdded(this[index], v);
        super.splice(index, 0, v);
        return this;
    }

    /**
     * Inserts a value to the beginning of array
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    public prepend (v : T) : this {
        this.listener.emitAdded(this[0], v);
        super.unshift(v);
        return this;
    }

    /**
     * Removes a value from an index
     * @param index {number} index of value to remove
     * @return {this} a pointer to this
     */
    public removeAt (index : number) : this {
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
    public removeFirst () : this {
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
    public removeLast () : this {
        const last = this.last;

        if (last != null) {
            this.listener.emitRemoved(this[this.length - 1], last);
            super.pop();
        }
        return this;
    }

    /**
     * Remove the first occurrence of value
     * @param v {*} value to remove
     * @return {this}
     */
    public removeOne (v : T) : this {
        this.removeAt(this.indexOf(v));
        return this;
    }

    public enableReactivity () {
        this.listener.enableReactivity();
    }

    public disableReactivity () {
        this.listener.disableReactivity();
    }
}

