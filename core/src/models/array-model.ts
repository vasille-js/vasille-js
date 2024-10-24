import { Listener } from "./listener";
import { ListenableModel } from "./model";

/**
 * Model based on Array class
 * @extends Array
 * @implements IModel
 */
export class ArrayModel<T> extends Array<T> implements ListenableModel<T, T> {
    public listener: Listener<T, T>;

    /**
     * @param data {Array} input data
     */
    public constructor(data?: Array<T> | number) {
        super();
        this.listener = new Listener();

        if (data instanceof Array) {
            for (let i = 0; i < data.length; i++) {
                super.push(data[i]);
            }
        }
    }

    /* Array members */

    /**
     * Calls Array.fill and notify about changes
     * @param value {*} value to fill with
     * @param start {?number} begin index
     * @param end {?number} end index
     */
    public fill(value: T, start?: number, end?: number): this {
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
    public pop(): T | undefined {
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
    public push(...items: Array<T>): number {
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
    public shift(): T | undefined {
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
    public splice(start: number, deleteCount?: number, ...items: Array<T>): ArrayModel<T> {
        start = Math.min(start, this.length);
        deleteCount = typeof deleteCount === "number" ? deleteCount : this.length - start;

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
    public unshift(...items: Array<T>): number {
        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded(this[i], items[i]);
        }
        return super.unshift(...items);
    }

    public replace(at: number, with_: T): this {
        this.listener.emitAdded(this[at], with_);
        this.listener.emitRemoved(this[at], this[at]);
        this[at] = with_;
        return this;
    }

    public destroy(): void {
        this.splice(0);
    }
}
