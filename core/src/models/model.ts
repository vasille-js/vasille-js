import { IDestroyable } from "../core/destroyable";
import { Listener } from "./listener";

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
