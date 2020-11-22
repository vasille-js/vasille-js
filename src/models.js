// @flow
import { IValue } from "./interfaces/ivalue.js";
import { Value }  from "./value.js";



/**
 * Represent a listener for a model
 */
class Listener {
    /**
     * Functions to run on adding new items
     * @type {Array<Function>}
     */
    onAdded : Array<Function> = [];

    /**
     * Functions to run on item removing
     * @type {Array<Function>}
     */
    onRemoved : Array<Function> = [];

    /**
     * Emits added event to listeners
     * @param index {number | string | null} index of value
     * @param value {IValue} value of added item
     */
    emitAdded ( index : number | string | any, value : IValue<any> ) {
        for (let handler of this.onAdded) {
            handler ( index, value );
        }
    }

    /**
     * Emits removed event to listeners
     * @param index {number | string | null} index of removed value
     * @param value {IValue} value of removed item
     */
    emitRemoved ( index : number | string | any, value : IValue<any> ) {
        for (let handler of this.onRemoved) {
            handler ( index, value );
        }
    }

    /**
     * Adds an handler to added event
     * @param handler {Function} function to run on event emitting
     */
    onAdd ( handler : Function ) {
        this.onAdded.push ( handler );
    }

    /**
     * Adds an handler to removed event
     * @param handler {Function} function to run on event emitting
     */
    onRemove ( handler : Function ) {
        this.onRemoved.push ( handler );
    }

    /**
     * Removes an handler from added event
     * @param handler {Function} handler to remove
     */
    offAdd ( handler : Function ) {
        let i = this.onAdded.indexOf ( handler );

        if (i >= 0) {
            this.onAdded.splice ( i, 1 );
        }
    }

    /**
     * Removes an handler form removed event
     * @param handler {Function} handler to remove
     */
    offRemove ( handler : Function ) {
        let i = this.onRemoved.indexOf ( handler );

        if (i >= 0) {
            this.onRemoved.splice ( i, 1 );
        }
    }
}

/**
 * Model based on <b>Array</b> class
 * @extends Array<IValue>
 */
export class ArrayModel<T> extends Array<IValue<T>> {
    /**
     * Listener of array model
     * @type {Listener}
     */
    listener : Listener = new Listener ();

    /* Constructor */

    /**
     * Constructs an array model from an array
     * @param data {Array<IValue>} input data
     */
    constructor ( data : Array<any> = [] ) {
        super ();

        for (let i = 0; i < data.length; i++) {
            super.push ( vassilify ( data[i] ) );
        }
    }

    /* Array members */

    /**
     * Gets the last value of array and null when it is empty
     * @return {?IValue}
     */
    get last () : ?IValue<T> {
        return this.length ? this[this.length - 1] : null;
    }

    /**
     * Calls Array.fill and notify about changes
     * @param value {*} value to fill with
     * @param start {?number} begin index
     * @param end {?number} end index
     * @return {ArrayModel} a pointer to this
     */
    fill ( value : any, start : ?number, end : ?number ) : this {
        if (!start) {
            start = 0;
        }
        if (!end) {
            end = this.length;
        }

        for (let i = start; i < end; i++) {
            if (this[i] instanceof IValue) {
                this[i].set ( value );
            }
        }
        return this;
    }

    /**
     * Calls Array.pop and notify about changes
     * @return {IValue} removed value
     */
    pop () : IValue<T> {
        let v = super.pop ();

        if (v) {
            this.listener.emitRemoved ( this.length, v );
        }
        return v;
    }

    /**
     * Calls Array.push and notify about changes
     * @param items {...IValue} values to push
     * @return {number} new length of array
     */
    push ( ...items : Array<any> ) : number {
        for (let item of items) {
            let v = vassilify ( item );

            this.listener.emitAdded ( this.length, v );
            super.push ( v );
        }
        return this.length;
    }

    /**
     * Calls Array.shift and notify about changed
     * @return {IValue} the shifted value
     */
    shift () : IValue<T> {
        let v = super.shift ();

        if (v) {
            this.listener.emitRemoved ( 0, v );
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
        ...items : ?Array<any>
    ) : ArrayModel<T> {
        start = Math.min ( start, this.length );
        items = items ? items.map ( ( v ) => vassilify ( v ) ) : [];
        deleteCount = deleteCount || this.length - start;

        for (let i = 0; i < deleteCount; i++) {
            let index = start + deleteCount - i - 1;
            if (this[index]) {
                this.listener.emitRemoved ( index, this[index] );
            }
        }
        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded ( start + i, items[i] );
        }

        return new ArrayModel ( super.splice ( start, deleteCount, ...items ) );
    }

    /* Vasile.js array interface */

    /**
     * Calls Array.unshift and notify about changed
     * @param items {...IValue} values to insert
     * @return {number | void} the length after prepend
     */
    unshift ( ...items : Array<any> ) : number {
        items = items.map ( ( v ) => vassilify ( v ) );

        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded ( i, items[i] );
        }
        return super.unshift ( ...items );
    }

    /**
     * Inserts a value to the end of array
     * @param v {IValue} value to insert
     * @return {ArrayModel} a pointer to this
     */
    append ( v : any ) : this {
        v = vassilify ( v );
        this.listener.emitAdded ( this.length, v );
        super.push ( v );
        return this;
    }

    /**
     * Clears array
     * @return {ArrayModel} a pointer to this
     */
    clear () : this {
        for (let v of this) {
            this.listener.emitRemoved ( 0, v );
        }
        super.splice ( 0 );
        return this;
    }

    /**
     * Inserts a value to position <i>index</i>
     * @param index {number} index to insert value
     * @param v {IValue} value to insert
     * @return {ArrayModel} a pointer to this
     */
    insert ( index : number, v : any ) : this {
        v = vassilify ( v );
        this.listener.emitAdded ( index, v );
        super.splice ( index, 0, v );
        return this;
    }

    /**
     * Inserts a value to the beginning of array
     * @param v {IValue} value to insert
     * @return {ArrayModel} a pointer to this
     */
    prepend ( v : any ) : this {
        v = vassilify ( v );
        this.listener.emitAdded ( 0, v );
        super.unshift ( v );
        return this;
    }

    /**
     * Removes a value from an index
     * @param index {number} index of value to remove
     * @return {ArrayModel} a pointer to this
     */
    removeAt ( index : number ) : this {
        if (this[index]) {
            this.listener.emitRemoved ( index, this[index] );
            super.splice ( index, 1 );
        }
        return this;
    }

    /**
     * Removes the first value of array
     * @return {ArrayModel} a pointer to this
     */
    removeFirst () : this {
        if (this.length) {
            this.listener.emitRemoved ( 0, this[0] );
            super.shift ();
        }
        return this;
    }

    /**
     * Removes the ast value of array
     * @return {ArrayModel} a pointer to this
     */
    removeLast () : this {
        if (this.last) {
            this.listener.emitRemoved ( this.length - 1, this.last );
            super.pop ();
        }
        return this;
    }

    /**
     * Remove the first occurrence of value
     * @param v {IValue} value to remove
     * @return {ArrayModel}
     */
    removeOne ( v : IValue<T> ) : this {
        this.removeAt ( this.indexOf ( v ) );
        return this;
    }
}

/**
 * A <b>Object</b> based model
 * @extends Object<String, IValue>
 */
export class ObjectModel<T> extends Object {
    /**
     * the listener of object
     * @type {Listener}
     */
    listener : Listener = new Listener ();

    /**
     * Constructs a object model from an object
     * @param obj {Object<String, IValue>} input data
     */
    constructor ( obj : Object = {} ) {
        super ();
        let ts : { [key : string] : IValue<T> } = this;

        for (let i in obj) {
            ts[i] = vassilify ( obj[i] );
        }
    }

    get ( key : string ) : IValue<T> {
        let ts : { [key : string] : IValue<T> } = this;

        return ts[key];
    }

    /**
     * Sets a object property value <b>(use for new properties only)</b>
     * @param key {string} property name
     * @param v {IValue} property value
     * @return {ObjectModel} a pointer to this
     */
    set ( key : string, v : any ) : this {
        let ts : { [key : string] : IValue<T> } = this;

        if (ts[key]) {
            this.listener.emitRemoved ( key, ts[key] );
        }
        ts[key] = vassilify ( v );
        this.listener.emitAdded ( key, ts[key] );

        return this;
    }

    /**
     * Deletes a object property
     * @param key {string} property name
     */
    delete ( key : string ) {
        let ts : { [key : string] : IValue<T> } = this;

        if (ts[key]) {
            this.listener.emitRemoved ( key, ts[key] );
            delete ts[key];
        }
    }
}

/**
 * A <b>Map</b> based memory
 * @extends Map<*, IValue>
 */
export class MapModel<K, T> extends Map<K, IValue<T>> {
    /**
     * listener of map
     * @type {Listener}
     */
    listener : Listener = new Listener ();

    /**
     * Constructs a map model based on a map
     * @param map {Map<*, IValue>} input data
     */
    constructor ( map : Map<K, any> = new Map ) {
        super ();

        for (let data of map) {
            super.set ( data[0], vassilify ( data[1] ) );
        }
    }

    /**
     * Calls Map.clear and notify abut changes
     */
    clear () {
        for (let data of this) {
            this.listener.emitRemoved ( data[0], data[1] );
        }
        super.clear ();
    }

    /**
     * Calls Map.delete and notify abut changes
     * @param key {*} key
     * @return {boolean} true if removed something, otherwise false
     */
    delete ( key : any ) : boolean {
        let tmp = super.get ( key );
        if (tmp) {
            this.listener.emitRemoved ( key, tmp );
        }
        return super.delete ( key );
    }

    /**
     * Calls Map.set and notify abut changes
     * @param key {*} key
     * @param value {IValue} value
     * @return {MapModel} a pointer to this
     */
    set ( key : any, value : any ) : this {
        let tmp = super.get ( key );
        if (tmp) {
            this.listener.emitRemoved ( key, tmp );
        }

        let v = vassilify ( value );
        super.set ( key, v );
        this.listener.emitAdded ( key, v );

        return this;
    }
}

/**
 * A <b>Set</b> based model
 * @extends Set<IValue>
 */
export class SetModel<T> extends Set<IValue<T>> {
    listener : Listener = new Listener ();

    /**
     * Constructs a set model based on a set
     * @param set {Set<IValue>} input data
     */
    constructor ( set : Set<any> = new Set ) {
        super ();

        for (let item of set) {
            super.add ( vassilify ( item ) );
        }
    }

    /**
     * Calls Set.add and notify abut changes
     * @param value {IValue} value
     * @return {SetModel} a pointer to this
     */
    add ( value : any ) : this {
        value = vassilify ( value );

        if (!super.has ( value )) {
            this.listener.emitAdded ( null, value );
            super.add ( value );
        }
        return this;
    }

    /**
     * Calls Set.clear and notify abut changes
     */
    clear () {
        for (let item of this) {
            this.listener.emitRemoved ( null, item );
        }
        super.clear ();
    }

    /**
     * Calls Set.delete and notify abut changes
     * @param value {IValue}
     * @return {boolean} true if a value was deleted, otherwise false
     */
    delete ( value : IValue<T> ) : boolean {
        if (super.has ( value )) {
            this.listener.emitRemoved ( null, value );
        }
        return super.delete ( value );
    }
}

/**
 * Transforms a JS value to a Vasille.js value
 * @param v {*} input value
 * @return {IValue} transformed value
 */
export function vassilify ( v : any ) : IValue<any> {
    let ret;

    if (v instanceof IValue) {
        ret = v;
    }
    else if (Array.isArray ( v )) {
        ret = new Value ( new ArrayModel ( v ) );
    }
    else if (v instanceof Map) {
        ret = new Value ( new MapModel ( v ) );
    }
    else if (v instanceof Set) {
        ret = new Value ( new SetModel ( v ) );
    }
    else if (v instanceof Object && v.constructor === Object) {
        ret = new Value ( new ObjectModel ( v ) );
    }
    else {
        ret = new Value ( v );
    }

    return ret;
}
