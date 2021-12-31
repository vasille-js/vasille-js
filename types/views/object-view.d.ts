import { BaseView, BaseViewPrivate } from "./base-view";
import { ObjectModel } from "../models/object-model";
import { Fragment } from "../node/node";
/**
 * private part of object view
 * @class ObjectViewPrivate
 * @extends BaseViewPrivate
 */
export declare class ObjectViewPrivate<T> extends BaseViewPrivate<string, T> {
    /**
     * Handler of property changes
     * @type {Object<string, function>}
     */
    handlers: {
        [key: string]: () => void;
    };
    constructor();
    $destroy(): void;
}
/**
 * Create a children pack for each object field
 * @class ObjectView
 * @extends BaseView
 */
export declare class ObjectView<T> extends BaseView<string, T, ObjectModel<T>> {
    protected $: ObjectViewPrivate<T>;
    constructor($?: ObjectViewPrivate<T>);
    createChild(id: string, item: T, before?: Fragment): any;
    destroyChild(id: string, item: T): void;
    $ready(): void;
    $destroy(): void;
}
