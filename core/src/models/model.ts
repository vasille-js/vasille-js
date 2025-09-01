import { Destroyable } from "../core/destroyable.js";
import { Listener } from "./listener.js";

export interface ListenableModel<K, T> extends Destroyable {
    /**
     * The listener of model
     * @type Listener
     */
    listener: Listener<T, K>;
}
