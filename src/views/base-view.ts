import { RepeatNode, RepeatNodePrivate } from "./repeat-node";
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

/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
export class BaseView<K, T, Model extends ListenableModel<K, T>> extends RepeatNode<K, T> {

    protected $ : BaseViewPrivate<K, T>;

    /**
     * Property which will contain a model
     * @type {IModel}
     */
    public model : Model;

    public constructor ($1 ?: BaseViewPrivate<K, T>) {
        super($1 || new BaseViewPrivate);

        const $ : BaseViewPrivate<K, T> = this.$;
        $.addHandler = (id, item) => {
            this.createChild(id, item);
        };
        $.removeHandler = (id, item) => {
            this.destroyChild(id, item);
        };

        this.seal();
    }


    /**
     * Handle ready event
     */
    public ready () {
        const $ : BaseViewPrivate<K, T> = this.$;

        this.model.listener.onAdd($.addHandler);
        this.model.listener.onRemove($.removeHandler);
        super.ready();
    }

    /**
     * Handles destroy event
     */
    public destroy () {
        const $ : BaseViewPrivate<K, T> = this.$;

        this.model.listener.offAdd($.addHandler);
        this.model.listener.offRemove($.removeHandler);
        super.destroy();
    }
}
