import { Listener } from "./listener";
import type { IModel } from "./model";
/**
 * A Map based memory
 * @class MapModel
 * @extends Map
 * @implements IModel
 */
export declare class MapModel<K, T> extends Map<K, T> implements IModel<K, T> {
    listener: Listener<T, K>;
    /**
     * Constructs a map model
     * @param map {[*, *][]} input data
     */
    constructor(map?: [K, T][]);
    /**
     * Calls Map.clear and notify abut changes
     */
    clear(): void;
    /**
     * Calls Map.delete and notify abut changes
     * @param key {*} key
     * @return {boolean} true if removed something, otherwise false
     */
    delete(key: any): boolean;
    /**
     * Calls Map.set and notify abut changes
     * @param key {*} key
     * @param value {*} value
     * @return {MapModel} a pointer to this
     */
    set(key: K, value: T): this;
    enableReactivity(): void;
    disableReactivity(): void;
}
