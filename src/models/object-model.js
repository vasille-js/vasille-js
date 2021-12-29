// @flow
import { Listener } from "./listener";
import type { IModel } from "./model";



/**
 * A Object based model
 * @extends Object<String, IValue>
 */
export class ObjectModel<T> extends Object implements IModel {
    /**
     * the listener of object
     * @type {Listener}
     */
    listener : Listener<T, string>;

    /**
     * Constructs a object model from an object
     * @param obj {Object<String, IValue>} input data
     */
    constructor (obj : { [p : string] : T } = {}) {
        super();

        ObjectModel.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            customisable: false
        });

        let ts : { [key : string] : T } = this;

        for (let i in obj) {
            ts[i] = obj[i];
        }
    }

    /**
     * Gets a value of a field
     * @param key {string}
     * @return {IValue<*>}
     */
    get (key : string) : T {
        let ts : { [key : string] : T } = this;

        return ts[key];
    }

    /**
     * Sets an object property value <b>(use for new properties only)</b>
     * @param key {string} property name
     * @param v {*} property value
     * @return {ObjectModel} a pointer to this
     */
    set (key : string, v : T) : this {
        let ts : { [key : string] : T } = this;

        if (ts[key]) {
            this.listener.emitRemoved(key, ts[key]);
        }
        ts[key] = v;
        this.listener.emitAdded(key, ts[key]);

        return this;
    }

    /**
     * Deletes an object property
     * @param key {string} property name
     */
    delete (key : string) {
        let ts : { [key : string] : T } = this;

        if (ts[key]) {
            this.listener.emitRemoved(key, ts[key]);
            delete ts[key];
        }
    }

    enableReactivity () {
        this.listener.enableReactivity();
    }

    disableReactivity () {
        this.listener.disableReactivity();
    }
}

