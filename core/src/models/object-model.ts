import { Listener } from "./listener";
import { ListenableModel } from "./model";

/**
 * Object based model
 * @extends Object
 */
export class ObjectModel<T> extends Object implements ListenableModel<string, T> {
    public listener: Listener<T, string>;
    private container: Record<string, T> = Object.create(null);

    /**
     * Constructs a object model
     * @param obj {Object} input data
     */
    public constructor(obj: { [p: string]: T } = {}) {
        super();

        Object.defineProperty(this, "listener", {
            value: new Listener(),
            writable: false,
            configurable: false,
        });

        for (const i in obj) {
            Object.defineProperty(this.container, i, {
                value: obj[i],
                configurable: true,
                writable: true,
                enumerable: true,
            });
            this.listener.emitAdded(i, obj[i]);
        }
    }

    /**
     * Gets a value of a field
     * @param key {string}
     * @return {*}
     */
    public get(key: string): T {
        return this.container[key];
    }

    /**
     * Sets an object property value
     * @param key {string} property name
     * @param v {*} property value
     * @return {ObjectModel} a pointer to this
     */
    public set(key: string, v: T): this {
        if (key in this.container) {
            this.listener.emitRemoved(key, this.container[key]);
            this.container[key] = v;
        } else {
            Object.defineProperty(this.container, key, {
                value: v,
                configurable: true,
                writable: true,
                enumerable: true,
            });
        }
        this.listener.emitAdded(key, this.container[key]);

        return this;
    }

    get values() {
        return this.container;
    }

    /**
     * Deletes an object property
     * @param key {string} property name
     */
    public delete(key: string) {
        if (this.container[key]) {
            this.listener.emitRemoved(key, this.container[key]);
            delete this.container[key];
        }
    }

    public enableReactivity() {
        this.listener.enableReactivity();
    }

    public disableReactivity() {
        this.listener.disableReactivity();
    }
}
