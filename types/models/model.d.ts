import { Listener } from "./listener";
/**
 * @interface IModel
 */
export interface IModel<K, T> {
    /**
     * Enable the reactivity of model
     */
    enableReactivity(): void;
    /**
     * Disable the reactivity of model
     */
    disableReactivity(): void;
    /**
     * The listener of model
     * @type Listener
     */
    listener: Listener<T, K>;
}
