import { BaseView, BaseViewPrivate } from "./base-view";
import { ArrayModel } from "../models/array-model";
import { Fragment } from "../node/node";
/**
 * Private part of array view
 * @class ArrayViewPrivate
 * @extends BaseViewPrivate
 */
export declare class ArrayViewPrivate<T> extends BaseViewPrivate<T, T> {
    /**
     * Contains handlers of each child
     * @type {Map}
     */
    handlers: Map<T, () => void>;
    constructor();
    $destroy(): void;
}
/**
 * Represents a view of an array model
 * @class ArrayView
 * @extends BaseView
 */
export declare class ArrayView<T> extends BaseView<T, T, ArrayModel<T>> {
    protected $: ArrayViewPrivate<T>;
    constructor($?: ArrayViewPrivate<T>);
    createChild(id: T, item: T, before?: Fragment): any;
    destroyChild(id: T, item: T): void;
    $ready(): void;
    $destroy(): void;
}
