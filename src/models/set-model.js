// @flow
import { Listener } from "./listener";
import type { IModel } from "./model";

/**
 * A Set based model
 * @extends Set<IValue>
 */
export class SetModel<T> extends Set<T> implements IModel {
    listener : Listener<T, null>;

    /**
     * Constructs a set model based on a set
     * @param set {Set<IValue>} input data
     */
    constructor (set : T[] = []) {
        super();

        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            customisable: false
        });

        for (let item of set) {
            super.add(item);
        }
    }

    /**
     * Calls Set.add and notify abut changes
     * @param value {*} value
     * @return {this} a pointer to this
     */
    add (value : T) : this {

        if (!super.has(value)) {
            this.listener.emitAdded(null, value);
            super.add(value);
        }
        return this;
    }

    /**
     * Calls Set.clear and notify abut changes
     */
    clear () {
        for (let item of this) {
            this.listener.emitRemoved(null, item);
        }
        super.clear();
    }

    /**
     * Calls Set.delete and notify abut changes
     * @param value {IValue}
     * @return {boolean} true if a value was deleted, otherwise false
     */
    delete (value : T) : boolean {
        if (super.has(value)) {
            this.listener.emitRemoved(null, value);
        }
        return super.delete(value);
    }

    enableReactivity () {
        this.listener.enableReactivity();
    }

    disableReactivity () {
        this.listener.disableReactivity();
    }
}

