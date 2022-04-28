import { RepeatNode, RepeatNodePrivate, RNO } from "./repeat-node";
import { ListenableModel } from "../models/model";
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
export interface BSO<K, T, Model extends ListenableModel<K, T>> extends RNO<T, K> {
    model: Model;
}
/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
export declare class BaseView<K, T, Model extends ListenableModel<K, T>> extends RepeatNode<K, T, BSO<K, T, Model>> {
    protected $: BaseViewPrivate<K, T>;
    input: BSO<K, T, Model>;
    constructor($?: BaseViewPrivate<K, T>);
    protected compose(input: BSO<K, T, Model>): void;
}
