import { Listener } from "./listener";

/**
 * @interface IModel
 */
export interface IModel {
    /**
     * Enable the reactivity of model
     */
    enableReactivity(): void;

    /**
     * Disable the reactivity of model
     */
    disableReactivity(): void;
}

export interface ListenableModel<K, T> extends IModel {
    /**
     * The listener of model
     * @type Listener
     */
    listener: Listener<T, K>;
}
