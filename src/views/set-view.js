// @flow
import { BaseView, BaseViewPrivate } from "./base-view";
import { SetModel } from "../models/set-model";
import { Fragment } from "../node/node";
import { IValue } from "../core/ivalue";



/**
 * private part of set view
 */
export class SetViewPrivate<T> extends BaseViewPrivate<null, T> {
    /**
     * Contains update handler for each value
     * @type {Map<IValue<*>, Function>}
     */
    handlers : Map<T, () => void> = new Map();

    constructor () {
        super ();
        this.$seal();
    }
}

/**
 * Create a children pack for each set value
 */
export class SetView<T> extends BaseView<null, T, SetModel<T>> {

    /**
     * Sets up model
     */
    constructor ($ : ?SetViewPrivate<T>) {
        super($ || new SetViewPrivate);
        this.model = this.$ref(new SetModel<T>);
    }

    /**
     * Saves the child handler
     */
    createChild (id : null, item : T, before : ?Fragment) : any {
        let $ : SetViewPrivate<T> = this.$;
        let handler = super.createChild(id, item, before);

        if (item instanceof IValue) {
            item.on(handler);
        }
        $.handlers.set(item, handler);
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : null, item : T) {
        let $ : SetViewPrivate<T> = this.$;
        let handler = $.handlers.get(item);

        if (item instanceof IValue && handler) {
            item.off(handler);
        }
        $.handlers.delete(item);
        super.destroyChild(id, item);
    }

    /**
     * Handler ready event
     */
    $ready () {
        let $ : SetViewPrivate<T> = this.$;
        let set : SetModel<T> = this.model.$;

        for (let it of set) {
            $.app.$run.callCallback(() => {
                this.createChild(null, it);
            });
        }

        super.$ready();
    }

    /**
     * Handler destroy event
     */
    $destroy () {
        let $ : SetViewPrivate<T> = this.$;
        let set : SetModel<T> = this.model.$;

        for (let it of set) {
            const handler = $.handlers.get (it);

            if (it instanceof IValue && handler) {
                it.off(handler);
            }
        }

        super.$destroy();
    }
}

