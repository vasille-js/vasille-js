import { IDestroyable } from "../core/destroyable.js";
import { Listener } from "./listener.js";

/**
 * @interface IModel
 */
export interface IModel extends IDestroyable {}

export interface ListenableModel<K, T> extends IModel {
    /**
     * The listener of model
     * @type Listener
     */
    listener: Listener<T, K>;
}
