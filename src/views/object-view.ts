// @flow
import { BaseView, BaseViewPrivate } from "./base-view";
import { ObjectModel } from "../models/object-model";
import { Fragment } from "../node/node";
import { IValue } from "../core/ivalue";



/**
 * private part of object view
 */
export class ObjectViewPrivate<T> extends BaseViewPrivate<string, T> {
    /**
     * Handler of property changes
     * @type {Object<string, function>}
     */
    public handlers : { [key : string] : () => void } = {};

    public constructor () {
        super ();
        this.$seal();
    }
}

/**
 * Create a children pack for each object field
 */
export class ObjectView<T> extends BaseView<string, T, ObjectModel<T>> {
    protected $ : ObjectViewPrivate<T>;

    /**
     * Sets up model
     */
    public constructor ($ ?: ObjectViewPrivate<T>) {
        super($ || new ObjectViewPrivate);
        this.model = this.$ref(new ObjectModel);
    }

    /**
     * Saves the child handler
     */
    public createChild (id : string, item : T, before ?: Fragment) : any {
        let $ : ObjectViewPrivate<T> = this.$;
        let handler = super.createChild(id, item, before);

        if (item instanceof IValue) {
            item.on(handler);
        }
        $.handlers[id] = handler;
    }

    /**
     * Disconnects the child handler
     */
    public destroyChild (id : string, item : T) {
        let $ : ObjectViewPrivate<T> = this.$;

        if (item instanceof IValue) {
            item.off($.handlers[id]);
        }
        delete $.handlers[id];
        super.destroyChild(id, item);
    }

    /**
     * Handler ready event
     */
    public $ready () {
        let $ : ObjectViewPrivate<T> = this.$;
        let obj : ObjectModel<T> = this.model.$;

        for (let i in obj) {
            if (obj.hasOwnProperty(i) && obj.get(i) instanceof IValue) {
                $.app.$run.callCallback(() => {
                    this.createChild(i, obj.get(i));
                });
            }
        }

        super.$ready();
    }

    /**
     * Handler destroy event
     */
    public $destroy () {
        let $ : ObjectViewPrivate<T> = this.$;
        let obj : ObjectModel<T> = this.model.$;

        for (let i in obj) {
            if (obj.hasOwnProperty(i)) {
                let item = obj.get(i);

                if (item instanceof IValue) {
                    item.off($.handlers[i]);
                }
            }
        }

        super.$destroy();
    }
}

