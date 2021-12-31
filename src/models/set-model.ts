import { Listener } from "./listener";
import type { IModel } from "./model";

/**
 * A Set based model
 * @class SetModel
 * @extends Set
 * @implements IModel
 */
export class SetModel<T> extends Set<T> implements IModel<null, T> {
    public listener : Listener<T, null>;

    /**
     * Constructs a set model based on a set
     * @param set {Set} input data
     */
    public constructor (set : T[] = []) {
        super();

        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
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
    public add (value : T) : this {

        if (!super.has(value)) {
            this.listener.emitAdded(null, value);
            super.add(value);
        }
        return this;
    }

    /**
     * Calls Set.clear and notify abut changes
     */
    public clear () {
        for (let item of this) {
            this.listener.emitRemoved(null, item);
        }
        super.clear();
    }

    /**
     * Calls Set.delete and notify abut changes
     * @param value {*}
     * @return {boolean} true if a value was deleted, otherwise false
     */
    public delete (value : T) : boolean {
        if (super.has(value)) {
            this.listener.emitRemoved(null, value);
        }
        return super.delete(value);
    }

    public enableReactivity () {
        this.listener.enableReactivity();
    }

    public disableReactivity () {
        this.listener.disableReactivity();
    }
}

