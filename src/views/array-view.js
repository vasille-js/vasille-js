// @flow
import { BaseView, BaseViewPrivate } from "./base-view";
import { ArrayModel } from "../models/array-model";
import { IValue } from "../core/ivalue";
import { Fragment } from "../node/node";



/**
 * Private part of array view
 */
export class ArrayViewPrivate<T> extends BaseViewPrivate<?T, T> {
    /**
     * Contains handlers of each child
     * @type {Map<IValue<*>, Function>}
     */
    handlers : Map<T, () => void> = new Map();

    constructor () {
        super ();
        this.$seal();
    }
}

/**
 * Represents a view of an array model
 */
export class ArrayView<T> extends BaseView<?T, T, ArrayModel<T>> {

    /**
     * model of view
     * @type {IValue<ArrayModel<*>>}
     */
    model : IValue<ArrayModel<T>>;

    /**
     * Sets up model with a default value
     */
    constructor ($ : ?ArrayViewPrivate<T>) {
        super($ || new ArrayViewPrivate);

        this.model = this.$ref(new ArrayModel);
        this.$seal();
    }



    /**
     * Overrides child created and generate random id for children
     */
    createChild (id : ?T, item : T, before : ?Fragment) : any {
        let $ : ArrayViewPrivate<T> = this.$;
        let next = $.nodes.get(id);
        let handler = super.createChild(item, item, before || next);

        $.handlers.set(item, handler);
    }

    /**
     * Removes a children pack
     */
    destroyChild (id : ?T, item : T) {
        let $ : ArrayViewPrivate<T> = this.$;
        let handler = $.handlers.get (item);

        if (item instanceof IValue && handler) {
            item.off (handler);
        }
        $.handlers.delete(item);
        super.destroyChild(item, item);
    }



    /**
     * Handle ready event
     */
    $ready () {
        let $ : ArrayViewPrivate<T> = this.$;
        let arr : ArrayModel<*> = this.model.$;

        for (let i = 0; i < arr.length; i++) {
            this.createChild(arr[i], arr[i]);
        }

        super.$ready();
    }

    /**
     * Handle destroy event
     */
    $destroy () {
        let $ : ArrayViewPrivate<T> = this.$;

        $.handlers.forEach((handler, value) => {
            if (value instanceof IValue) {
                value.off(handler);
            }
        });

        super.$destroy();
    }
}
