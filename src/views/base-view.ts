import { RepeatNode, RepeatNodePrivate, RNO } from "./repeat-node";
import { ListenableModel } from "../models/model";



/**
 * Private part of BaseView
 * @class BaseViewPrivate
 * @extends RepeatNodePrivate
 */
export class BaseViewPrivate<K, T> extends RepeatNodePrivate<K> {
    /**
     * Handler to catch values addition
     * @type {Function}
     */
    public addHandler : (index : K, value : T) => void;

    /**
     * Handler to catch values removes
     * @type {Function}
     */
    public removeHandler : (index : K, value : T) => void;

    public constructor () {
        super ();
        this.seal();
    }
}

export interface BSO<K, T, Model extends ListenableModel<K, T>> extends RNO<T, K> {
    model : Model;
}

/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
export class BaseView<K, T, Model extends ListenableModel<K, T>> extends RepeatNode<K, T, BSO<K, T, Model>> {

    protected $ : BaseViewPrivate<K, T>;

    input !: BSO<K, T, Model>;

    public constructor (input : BSO<K, T, Model>, $ ?: BaseViewPrivate<K, T>) {
        super(input, $ || new BaseViewPrivate);
    }

    protected compose(input: BSO<K, T, Model>) {
        const $ : BaseViewPrivate<K, T> = this.$;
        $.addHandler = (id, item) => {
            this.createChild(input, id, item);
        };
        $.removeHandler = (id, item) => {
            this.destroyChild(id, item);
        };

        input.model.listener.onAdd($.addHandler);
        input.model.listener.onRemove($.removeHandler);

        this.runOnDestroy(() => {
            input.model.listener.offAdd($.addHandler);
            input.model.listener.offRemove($.removeHandler);
        });
    }
}
