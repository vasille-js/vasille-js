import { BaseView, BSO } from "./base-view";
import { ArrayModel } from "../models/array-model";
import { Fragment } from "../node/node";
/**
 * Represents a view of an array model
 * @class ArrayView
 * @extends BaseView
 */
export declare class ArrayView<T> extends BaseView<T, T, ArrayModel<T>> {
    createChild(input: BSO<T, T, ArrayModel<T>>, id: T, item: T, before?: Fragment): any;
    protected compose(input: BSO<T, T, ArrayModel<T>>): void;
}
