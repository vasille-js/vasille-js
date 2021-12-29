// @flow
import { RepeatNode, RepeatNodePrivate } from "./repeat-node";
import { Listener } from "../models/listener";
import { IValue } from "../core/ivalue";
import { Fragment } from "../node/node";



/**
 * Private part of BaseView
 */
export class BaseViewPrivate<K, T> extends RepeatNodePrivate<K> {
    /**
     * Handler to catch values addition
     * @type {Function}
     */
    addHandler : (index : K, value : T) => void;

    /**
     * Handler to catch values removes
     * @type {Function}
     */
    removeHandler : (index : K, value : T) => void;

    constructor () {
        super ();
        this.$seal();
    }
}

/**
 * Base class of default views
 */
export class BaseView<K, T, Model> extends RepeatNode<K, T> {

    // props
    /**
     * Property which will contain a model
     * @type {IValue<*>}
     */
    model : IValue<{ listener: Listener<T, K> } & Model>;

    /**
     * Sets up model and handlers
     */
    constructor ($1 : ?BaseViewPrivate<K, T>) {
        super($1 || new BaseViewPrivate);

        let $ : BaseViewPrivate<K, T> = this.$;
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
     * @param id {*} id of children pack
     * @param item {IValue<*>} Reference of children pack
     * @param before {Fragment} Node to paste before it
     * @return {handler} handler must be saved and unliked on value remove
     */
    createChild (id : K, item : T, before : ?Fragment) : () => void {
        let handler = () => {
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
    $ready () {
        let $ : BaseViewPrivate<K, T> = this.$;

        this.model.$.listener.onAdd($.addHandler);
        this.model.$.listener.onRemove($.removeHandler);
        super.$ready();
    }

    /**
     * Handles destroy event
     */
    $destroy () {
        let $ : BaseViewPrivate<K, T> = this.$;

        this.model.$.listener.offAdd($.addHandler);
        this.model.$.listener.offRemove($.removeHandler);
        super.$destroy();
    }
}
