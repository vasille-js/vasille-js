// @flow
import { Listener } from "./listener";
import type { IModel } from "./model";



/**
 * A Object based model
 * @extends Object<String, IValue>
 */
export class ObjectModel<T> extends Object implements IModel<string, T> {
    /**
     * the listener of object
     * @type {Listener}
     */
    public listener : Listener<T, string>;

    /**
     * Constructs a object model from an object
     * @param obj {Object<String, IValue>} input data
     */
    public constructor (obj : { [p : string] : T } = {}) {
        super();

        ObjectModel.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });

        let ts = this as any as { [key : string] : T };

        for (let i in obj) {
            ts[i] = obj[i];
        }
    }

    /**
     * Gets a value of a field
     * @param key {string}
     * @return {IValue<*>}
     */
    public get (key : string) : T {
        let ts = this as any as { [key : string] : T };

        return ts[key];
    }

    /**
     * Sets an object property value <b>(use for new properties only)</b>
     * @param key {string} property name
     * @param v {*} property value
     * @return {ObjectModel} a pointer to this
     */
    public set (key : string, v : T) : this {
        let ts = this as any as { [key : string] : T };

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
    public delete (key : string) {
        let ts = this as any as { [key : string] : T };

        if (ts[key]) {
            this.listener.emitRemoved(key, ts[key]);
            delete ts[key];
        }
    }

    public enableReactivity () {
        this.listener.enableReactivity();
    }

    public disableReactivity () {
        this.listener.disableReactivity();
    }
}

