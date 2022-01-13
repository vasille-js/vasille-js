import { RepeatNode, RepeatNodePrivate } from "./repeat-node";
import { IModel } from "../models/model";
/**
 * Private part of BaseView
 * @class BaseViewPrivate
 * @extends RepeatNodePrivate
 */
export declare class BaseViewPrivate<K, T> extends RepeatNodePrivate<K> {
    /**
     * Handler to catch values addition
     * @type {Function}
     */
    addHandler: (index: K, value: T) => void;
    /**
     * Handler to catch values removes
     * @type {Function}
     */
    removeHandler: (index: K, value: T) => void;
    constructor();
}
/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
export declare class BaseView<K, T, Model extends IModel<K, T>> extends RepeatNode<K, T> {
    protected $: BaseViewPrivate<K, T>;
    /**
     * Property which will contain a model
     * @type {IModel}
     */
    model: Model;
    constructor($1?: BaseViewPrivate<K, T>);
    /**
     * Handle ready event
     */
    $ready(): void;
    /**
     * Handles destroy event
     */
    $destroy(): void;
}
