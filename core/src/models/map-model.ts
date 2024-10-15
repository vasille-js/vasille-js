import { Listener } from "./listener";
import { ListenableModel } from "./model";

/**
 * A Map based memory
 * @class MapModel
 * @extends Map
 * @implements IModel
 */
export class MapModel<K, T> extends Map<K, T> implements ListenableModel<K, T> {
    public listener: Listener<T, K>;

    /**
     * Constructs a map model
     * @param map {[*, *][]} input data
     */
    public constructor(map: [K, T][] = []) {
        super();

        Object.defineProperty(this, "listener", {
            value: new Listener(),
            writable: false,
            configurable: false,
        });

        map.forEach(([key, value]) => {
            super.set(key, value);
        });
    }

    /**
     * Calls Map.clear and notify abut changes
     */
    public clear() {
        this.forEach((value, key) => {
            this.listener.emitRemoved(key, value);
        });
        super.clear();
    }

    /**
     * Calls Map.delete and notify abut changes
     * @param key {*} key
     * @return {boolean} true if removed something, otherwise false
     */
    public delete(key: any): boolean {
        const tmp = super.get(key);
        if (tmp) {
            this.listener.emitRemoved(key, tmp);
        }
        return super.delete(key);
    }

    /**
     * Calls Map.set and notify abut changes
     * @param key {*} key
     * @param value {*} value
     * @return {MapModel} a pointer to this
     */
    public set(key: K, value: T): this {
        const tmp = super.get(key);
        if (tmp) {
            this.listener.emitRemoved(key, tmp);
        }

        super.set(key, value);
        this.listener.emitAdded(key, value);

        return this;
    }

    public enableReactivity() {
        this.listener.enableReactivity();
    }

    public disableReactivity() {
        this.listener.disableReactivity();
    }
}
