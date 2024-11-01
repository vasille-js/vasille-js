import { Listener } from "./listener";
import { ListenableModel } from "./model";

/**
 * Model based on Array class
 * @extends Array
 * @implements IModel
 */
export class ArrayModel<T> extends Array<T> implements ListenableModel<T, T> {
    public listener: Listener<T, T>;
    public passive: boolean = false;

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
        this.passive = true;
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
        this.passive = false;
        return this;
    }

    /**
     * Calls Array.pop and notify about changes
     * @return {*} removed value
     */
    public pop(): T | undefined {
        this.passive = true;
        const v = super.pop();

        if (v !== undefined) {
            this.listener.emitRemoved(v, v);
        }
        this.passive = false;
        return v;
    }

    /**
     * Calls Array.push and notify about changes
     * @param items {...*} values to push
     * @return {number} new length of array
     */
    public push(...items: Array<T>): number {
        this.passive = true;
        items.forEach(item => {
            this.listener.emitAdded(item, item);
            super.push(item);
        });
        this.passive = false;
        return this.length;
    }

    /**
     * Calls Array.shift and notify about changed
     * @return {*} the shifted value
     */
    public shift(): T | undefined {
        this.passive = true;
        const v = super.shift();

        if (v !== undefined) {
            this.listener.emitRemoved(v, v);
        }
        this.passive = false;
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
        this.passive = true;
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

        this.passive = false;
        return new ArrayModel<T>(super.splice(start, deleteCount, ...items));
    }

    /**
     * Calls Array.unshift and notify about changed
     * @param items {...*} values to insert
     * @return {number} the length after prepend
     */
    public unshift(...items: Array<T>): number {
        this.passive = true;
        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded(this[i], items[i]);
        }

        const r = super.unshift(...items);
        this.passive = false;
        return r;
    }

    public replace(at: number, with_: T): this {
        this.passive = true;
        this.listener.emitAdded(this[at], with_);
        this.listener.emitRemoved(this[at], this[at]);
        this[at] = with_;
        this.passive = false;
        return this;
    }

    public destroy(): void {
        this.splice(0);
    }
}

export function proxyArrayModel<T>(arr: ArrayModel<T>): ArrayModel<T> {
    return new Proxy(arr, {
        set(target, p, newValue, receiver) {
            if (!arr.passive && typeof p === "string") {
                const index = parseInt(p);

                if (Number.isFinite(index)) {
                    arr.replace(index, newValue);

                    return true;
                }
            }
            return Reflect.set(target, p, newValue, receiver);
        },
    });
}
