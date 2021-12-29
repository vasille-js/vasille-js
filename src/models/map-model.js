// @flow
import { Listener } from "./listener";
import type { IModel } from "./model";



/**
 * A Map based memory
 * @extends Map<*, IValue>
 */
export class MapModel<K, T> extends Map<K, T> implements IModel {
    /**
     * listener of map
     * @type {Listener}
     */
    listener : Listener<T, K>;

    /**
     * Constructs a map model based on a map
     * @param map {Map<*, IValue>} input data
     */
    constructor (map : [K, T][] = []) {
        super();

        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            customisable: false
        });

        for (let data of map) {
            super.set(data[0], data[1]);
        }
    }

    /**
     * Calls Map.clear and notify abut changes
     */
    clear () {
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
    delete (key : any) : boolean {
        let tmp = super.get(key);
        if (tmp) {
            this.listener.emitRemoved(key, tmp);
        }
        return super.delete(key);
    }

    /**
     * Calls Map.set and notify abut changes
     * @param key {*} key
     * @param value {IValue} value
     * @return {MapModel} a pointer to this
     */
    set (key : K, value : T) : this {
        let tmp = super.get(key);
        if (tmp) {
            this.listener.emitRemoved(key, tmp);
        }

        super.set(key, value);
        this.listener.emitAdded(key, value);

        return this;
    }

    enableReactivity () {
        this.listener.enableReactivity();
    }

    disableReactivity () {
        this.listener.disableReactivity();
    }
}

