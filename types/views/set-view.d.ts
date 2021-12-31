import { BaseView, BaseViewPrivate } from "./base-view";
import { SetModel } from "../models/set-model";
import { Fragment } from "../node/node";
/**
 * private part of set view
 * @class SetViewPrivate
 * @extends BaseViewPrivate
 */
export declare class SetViewPrivate<T> extends BaseViewPrivate<null, T> {
    /**
     * Contains update handler for each value
     */
    handlers: Map<T, () => void>;
    constructor();
    $destroy(): void;
}
/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
export declare class SetView<T> extends BaseView<null, T, SetModel<T>> {
    protected $: SetViewPrivate<T>;
    constructor($?: SetViewPrivate<T>);
    createChild(id: null, item: T, before?: Fragment): any;
    destroyChild(id: null, item: T): void;
    $ready(): void;
    $destroy(): void;
}
