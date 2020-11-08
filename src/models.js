// @flow
import { IValue } from "./interfaces/ivalue.js";
import { Value } from "./value.js";

type VassileType = IValue | ArrayModel | ObjectModel | MapModel | SetModel;

/**
 * Represent a listener for a model
 */
class Listener {
    /**
     * Functions to run on adding new items
     * @type {Array<Function>}
     */
    #onAdded: Array<Function> = [];

    /**
     * Functions to run on item removing
     * @type {Array<Function>}
     */
    #onRemoved: Array<Function> = [];

    /**
     * Emits added event to listeners
     * @param index {number | string | null} index of value
     * @param value {IValue | ArrayModel | ObjectModel | MapModel | SetModel} value of added item
     */
    emitAdded(index: number | string | null, value: VassileType) {
        for (let handler of this.#onAdded) {
            handler(index, value);
        }
    }

    /**
     * Emits removed event to listeners
     * @param index {number | string | null} index of removed value
     * @param value {IValue | ArrayModel | ObjectModel | MapModel | SetModel} value of removed item
     */
    emitRemoved(index: number | string | null, value: VassileType) {
        for (let handler of this.#onRemoved) {
            handler(index, value);
        }
    }

    /**
     * Adds an handler to added event
     * @param handler {Function} function to run on event emitting
     */
    onAdd(handler: Function) {
        this.#onAdded.push(handler);
    }

    /**
     * Adds an handler to removed event
     * @param handler {Function} function to run on event emitting
     */
    onRemove(handler: Function) {
        this.#onRemoved.push(handler);
    }

    /**
     * Removes an handler from added event
     * @param handler {Function} handler to remove
     */
    offAdd(handler: Function) {
        let i = this.#onAdded.indexOf(handler);

        if (i >= 0) {
            this.#onAdded.splice(i, 1);
        }
    }

    /**
     * Removes an handler form removed event
     * @param handler {Function} handler to remove
     */
    offRemove(handler: Function) {
        let i = this.#onRemoved.indexOf(handler);

        if (i >= 0) {
            this.#onRemoved.splice(i, 1);
        }
    }
}

/**
 * Model based on <b>Array</b> class
 * @extends Array<IValue | ArrayModel | ObjectModel | MapModel | SetModel>
 */
export class ArrayModel extends Array<VassileType> {
    /**
     * Listener of array model
     * @type {Listener}
     */
    listener: Listener = new Listener();

    /* Constructor */

    /**
     * Constructs an array model from an array
     * @param data {Array<IValue | ArrayModel | ObjectModel | MapModel | SetModel>} input data
     */
    constructor(data: Array<any> = []) {
        super();

        for (let i = 0; i < data.length; i++) {
            super.push(vassilify(data[i]));
        }
    }

    /* Array members */

    /**
     * Gets the last value of array and null when it is empty
     * @return {IValue | ArrayModel | ObjectModel | MapModel | SetModel | null}
     */
    get last(): ?VassileType {
        return this.length ? this[this.length - 1] : null;
    }

    /**
     * Calls Array.fill and notify about changes
     * @param value {*} value to fill with
     * @param start {?number} begin index
     * @param end {?number} end index
     * @return {ArrayModel} a pointer to this
     */
    fill(value: any, start: ?number, end: ?number): this {
        if (!start) start = 0;
        if (!end) end = this.length;

        for (let i = start; i < end; i++) {
            if (this[i] instanceof IValue) {
                this[i].set(value);
            }
        }
        return this;
    }

    /**
     * Calls Array.pop and notify about changes
     * @return {IValue | ArrayModel | ObjectModel | MapModel | SetModel} removed value
     */
    pop(): VassileType {
        let v = super.pop();

        if (v) this.listener.emitRemoved(this.length, v);
        return v;
    }

    /**
     * Calls Array.push and notify about changes
     * @param items {...IValue | ArrayModel | ObjectModel | MapModel | SetModel} values to push
     * @return {number} new length of array
     */
    push(...items: Array<any>): number {
        for (let item of items) {
            let v = vassilify(item);

            this.listener.emitAdded(this.length, v);
            super.push(v);
        }
        return this.length;
    }

    /**
     * Calls Array.shift and notify about changed
     * @return {IValue | ArrayModel | ObjectModel | MapModel | SetModel} the shifted value
     */
    shift(): VassileType {
        let v = super.shift();

        if (v) this.listener.emitRemoved(0, v);
        return v;
    }

    /**
     * Calls Array.splice and notify about changed
     * @param start {number} start index
     * @param deleteCount {?number} delete count
     * @param items {...IValue | ArrayModel | ObjectModel | MapModel | SetModel}
     * @return {ArrayModel} a pointer to this
     */
    splice(
        start: number,
        deleteCount: ?number,
        ...items: ?Array<any>
    ): ArrayModel {
        start = Math.min(start, this.length);
        items = items ? items.map((v) => vassilify(v)) : [];
        deleteCount = deleteCount || 0;

        for (let i = 0; i < deleteCount; i++) {
            if (this[start + i])
                this.listener.emitRemoved(start + i, this[start + i]);
        }
        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded(start + i, items[i]);
        }

        return new ArrayModel(super.splice(start, deleteCount, ...items));
    }

    /* Vasile.js array interface */

    /**
     * Calls Array.unshift and notify about changed
     * @param items {...IValue | ArrayModel | ObjectModel | MapModel | SetModel} values to insert
     * @return {number | void} the length after prepend
     */
    unshift(...items: Array<any>): number {
        items = items.map((v) => vassilify(v));

        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded(i, items[i]);
        }
        return super.unshift(...items);
    }

    /**
     * Inserts a value to the end of array
     * @param v {IValue | ArrayModel | ObjectModel | MapModel | SetModel} value to insert
     * @return {ArrayModel} a pointer to this
     */
    append(v: any): this {
        v = vassilify(v);
        this.listener.emitAdded(this.length, v);
        super.push(v);
        return this;
    }

    /**
     * Clears array
     * @return {ArrayModel} a pointer to this
     */
    clear(): this {
        for (let v of this) {
            this.listener.emitRemoved(0, v);
        }
        super.splice(0);
        return this;
    }

    /**
     * Inserts a value to position <i>index</i>
     * @param index {number} index to insert value
     * @param v {IValue | ArrayModel | ObjectModel | MapModel | SetModel} value to insert
     * @return {ArrayModel} a pointer to this
     */
    insert(index: number, v: any): this {
        v = vassilify(v);
        this.listener.emitAdded(index, v);
        super.splice(index, 0, v);
        return this;
    }

    /**
     * Inserts a value to the beggining of array
     * @param v {IValue | ArrayModel | ObjectModel | MapModel | SetModel} value to insert
     * @return {ArrayModel} a pointer to this
     */
    prepend(v: any): this {
        v = vassilify(v);
        this.listener.emitAdded(0, v);
        super.unshift(v);
        return this;
    }

    /**
     * Removes a value from an index
     * @param index {number} index of value to remove
     * @return {ArrayModel} a pointer to this
     */
    removeAt(index: number): this {
        if (this[index]) {
            this.listener.emitRemoved(index, this[index]);
            super.splice(index, 1);
        }
        return this;
    }

    /**
     * Removes the first value of array
     * @return {ArrayModel} a pointer to this
     */
    removeFirst(): this {
        if (this.length) {
            this.listener.emitRemoved(0, this[0]);
            super.shift();
        }
        return this;
    }

    /**
     * Removes the ast value of array
     * @return {ArrayModel} a pointer to this
     */
    removeLast(): this {
        if (this.last) {
            this.listener.emitRemoved(this.length - 1, this.last);
            super.pop();
        }
        return this;
    }

    /**
     * Remove the first occurrence of value
     * @param v {IValue | ArrayModel | ObjectModel | MapModel | SetModel} value to remove
     * @return {ArrayModel}
     */
    removeOne(v: IValue): this {
        this.removeAt(this.indexOf(v));
        return this;
    }
}

/**
 * A <b>Object</b> based model
 * @extends Object<String, IValue | ArrayModel | ObjectModel | MapModel | SetModel>
 */
export class ObjectModel extends Object {
    /**
     * the listener of object
     * @type {Listener}
     */
    listener: Listener = new Listener();

    /**
     * Constructs a object model from an object
     * @param obj {Object<String, IValue | ArrayModel | ObjectModel | MapModel | SetModel>} input data
     */
    constructor(obj: Object = {}) {
        super();
        let ts: { [key: string]: VassileType } = this;

        for (let i of obj) {
            ts[i] = vassilify(obj[i]);
        }
    }

    /**
     * Sets a object property value <b>(use for new properties only)</b>
     * @param key {string} property name
     * @param v {IValue | ArrayModel | ObjectModel | MapModel | SetModel} property value
     * @return {ObjectModel} a pointer to this
     */
    set(key: string, v: any): this {
        let ts: { [key: string]: VassileType } = this;

        if (ts[key]) {
            this.listener.emitRemoved(key, ts[key]);
        }
        ts[key] = vassilify(v);
        this.listener.emitAdded(key, ts[key]);

        return this;
    }

    /**
     * Deletes a object property
     * @param key {string} property name
     */
    delete(key: string) {
        let ts: { [key: string]: VassileType } = this;

        if (ts[key]) {
            this.listener.emitRemoved(key, ts[key]);
            delete ts[key];
        }
    }
}

/**
 * A <b>Map</b> based memory
 * @extends Map<any, IValue | ArrayModel | ObjectModel | MapModel | SetModel>
 */
export class MapModel extends Map<any, VassileType> {
    /**
     * listener of map
     * @type {Listener}
     */
    listener: Listener = new Listener();

    /**
     * Constructs a map model based on a map
     * @param map {Map<*, IValue | ArrayModel | ObjectModel | MapModel | SetModel>} input data
     */
    constructor(map: Map<any, any>) {
        super();

        for (let data of map) {
            super.set(data[0], vassilify(data[1]));
        }
    }

    /**
     * Calls Map.clear and notify abut changes
     */
    clear() {
        for (let data of this) {
            this.listener.emitRemoved(data[0], data[1]);
        }
        super.clear();
    }

    /**
     * Calls Map.delete and notify abut changes
     * @param key {*} key
     * @return {boolean} true if removed something, otherwise false
     */
    delete(key: any): boolean {
        let tmp = super.get(key);
        if (tmp) {
            this.listener.emitRemoved(key, tmp);
        }
        return super.delete(key);
    }

    /**
     * Calls Map.set and notify abut changes
     * @param key {*} key
     * @param value {IValue | ArrayModel | ObjectModel | MapModel | SetModel} value
     * @return {MapModel} a pointer to this
     */
    set(key: any, value: any): this {
        let tmp = super.get(key);
        if (tmp) {
            this.listener.emitRemoved(key, tmp);
        }

        let v = vassilify(value);
        super.set(key, v);
        this.listener.emitAdded(key, v);

        return this;
    }
}

/**
 * A <b>Set</b> based model
 * @extends Set<IValue | ArrayModel | ObjectModel | MapModel | SetModel>
 */
export class SetModel extends Set<VassileType> {
    listener: Listener = new Listener();

    /**
     * Constructs a set model based on a set
     * @param set {Set<IValue | ArrayModel | ObjectModel | MapModel | SetModel>} input data
     */
    constructor(set: Set<any>) {
        super();

        for (let item of set) {
            super.add(vassilify(item));
        }
    }

    /**
     * Calls Set.add and notify abut changes
     * @param value {IValue | ArrayModel | ObjectModel | MapModel | SetModel} value
     * @return {SetModel} a pointer to this
     */
    add(value: any): this {
        value = vassilify(value);

        if (!super.has(value)) {
            this.listener.emitAdded(null, value);
            super.add(value);
        }
        return this;
    }

    /**
     * Calls Set.clear and notify abut changes
     */
    clear() {
        for (let item of this) {
            this.listener.emitRemoved(null, item);
        }
        super.clear();
    }

    /**
     * Calls Set.delete and notify abut changes
     * @param value {IValue | ArrayModel | ObjectModel | MapModel | SetModel}
     * @return {boolean} true if a value was deleted, otherwise false
     */
    delete(value: VassileType): boolean {
        if (super.has(value)) {
            this.listener.emitRemoved(null, value);
        }
        return super.delete(value);
    }
}

/**
 * Transforms a JS value to a Vasille.js value
 * @param v {*} input value
 * @return {IValue | ArrayModel | ObjectModel | MapModel | SetModel} transformed value
 */
export function vassilify(
    v: any
): IValue | ArrayModel | ObjectModel | MapModel | SetModel {
    let ret;

    switch (v) {
        case v instanceof IValue:
        case v instanceof ArrayModel:
        case v instanceof ObjectModel:
        case v instanceof MapModel:
        case v instanceof SetModel:
            ret = v;
            break;

        case Array.isArray(v):
            ret = new ArrayModel(v);
            break;

        case v instanceof Map:
            ret = new MapModel(v);
            break;

        case v instanceof Set:
            ret = new SetModel(v);
            break;

        case v instanceof Object && v.constructor === Object:
            ret = new ObjectModel(v);
            break;

        default:
            ret = new Value(v);
    }

    return ret;
}
