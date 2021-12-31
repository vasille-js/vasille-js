import { Listener } from "./listener";
import type { IModel } from "./model";



/**
 * Object based model
 * @extends Object
 */
export class ObjectModel<T> extends Object implements IModel<string, T> {

    public listener : Listener<T, string>;

    /**
     * Constructs a object model
     * @param obj {Object} input data
     */
    public constructor (obj : { [p : string] : T } = {}) {
        super();

        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });

        const ts = this as never as { [key : string] : T };

        for (const i in obj) {
            Object.defineProperty(this, i, {
                value: obj[i],
                configurable: false
            });
        }
    }

    /**
     * Gets a value of a field
     * @param key {string}
     * @return {*}
     */
    public get (key : string) : T {
        const ts = this as never as { [key : string] : T };

        return ts[key];
    }

    /**
     * Sets an object property value
     * @param key {string} property name
     * @param v {*} property value
     * @return {ObjectModel} a pointer to this
     */
    public set (key : string, v : T) : this {
        const ts = this as never as { [key : string] : T };

        // eslint-disable-next-line no-prototype-builtins
        if (ts.hasOwnProperty(key)) {
            this.listener.emitRemoved(key, ts[key]);
            ts[key] = v;
        }
        else {
            Object.defineProperty(ts, key, {
                value: v,
                configurable: false
            });
        }
        this.listener.emitAdded(key, ts[key]);

        return this;
    }

    /**
     * Deletes an object property
     * @param key {string} property name
     */
    public delete (key : string) {
        const ts = this as never as { [key : string] : T };

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

