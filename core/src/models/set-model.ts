import { Reactive } from "../core/core.js";
import { Listener } from "./listener.js";
import { ListenableModel } from "./model.js";

/**
 * A `Set` based model
 * @class SetModel
 * @extends Set
 * @implements ListenableModel
 */
export class SetModel<T> extends Set<T> implements ListenableModel<T, T> {
    public listener: Listener<T, T>;

    /**
     * Constructs a set model based on a set
     */
    public constructor(set?: T[], ctx?: Reactive) {
        super();
        this.listener = new Listener();

        set?.forEach(item => {
            super.add(item);
        });
        ctx?.bind(this);
    }

    /**
     * Calls `Set.add` and notify abut changes
     * @param value {*} value
     * @return {this} a pointer to this
     */
    public add(value: T): this {
        /* istanbul ignore else */
        if (!super.has(value)) {
            this.listener.emitAdded(value, value);
            super.add(value);
        }
        return this;
    }

    /**
     * Calls `Set.clear` and notify abut changes
     */
    public clear() {
        this.forEach(item => {
            this.listener.emitRemoved(item, item);
        });
        super.clear();
    }

    /**
     * Calls `Set.delete` and notify abut changes
     * @param value {*}
     * @return {boolean} true if a value was deleted, otherwise false
     */
    public delete(value: T): boolean {
        if (super.has(value)) {
            this.listener.emitRemoved(value, value);
        }
        return super.delete(value);
    }

    public destroy(): void {
        this.clear();
    }
}
