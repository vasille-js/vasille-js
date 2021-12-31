import { RepeatNode, RepeatNodePrivate } from "./repeat-node";
import { IValue } from "../core/ivalue";
import { Fragment } from "../node/node";
import {IModel} from "../models/model";



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
        this.$seal();
    }
}

/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
export class BaseView<K, T, Model extends IModel<K, T>> extends RepeatNode<K, T> {

    protected $ : BaseViewPrivate<K, T>;

    /**
     * Property which will contain a model
     * @type {IValue<*>}
     */
    public model : IValue<Model>;

    public constructor ($1 ?: BaseViewPrivate<K, T>) {
        super($1 || new BaseViewPrivate);

        const $ : BaseViewPrivate<K, T> = this.$;
        $.addHandler = (id, item) => {
            this.createChild(id, item);
        };
        $.removeHandler = (id, item) => {
            this.destroyChild(id, item);
        };

        this.$seal();
    }

    /**
     * Creates a child when user adds new values
     * @param id {*} id of child
     * @param item {IValue} reference of child value
     * @param before {Fragment} Node to paste before it
     * @return {handler} handler must be saved and unlinked on value remove
     */
    public createChild (id : K, item : T, before ?: Fragment) : () => void {
        const handler = () => {
            this.createChild(id, item);
        };
        if (item instanceof IValue) {
            item.on(handler);
        }
        super.createChild(id, item, before);

        return handler;
    }



    /**
     * Handle ready event
     */
    public $ready () {
        const $ : BaseViewPrivate<K, T> = this.$;

        this.model.$.listener.onAdd($.addHandler);
        this.model.$.listener.onRemove($.removeHandler);
        super.$ready();
    }

    /**
     * Handles destroy event
     */
    public $destroy () {
        const $ : BaseViewPrivate<K, T> = this.$;

        this.model.$.listener.offAdd($.addHandler);
        this.model.$.listener.offRemove($.removeHandler);
        super.$destroy();
    }
}
