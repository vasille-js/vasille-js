// @flow
import { BaseView, BaseViewPrivate } from "./base-view";
import { IValue } from "../core/ivalue";
import { MapModel } from "../models/map-model";
import { Fragment } from "../node/node";



/**
 * private part of map view
 */
export class MapViewPrivate<K, T> extends BaseViewPrivate<K, T> {
    /**
     * Contains update handler for each value
     * @type {Map<*, Function>}
     */
    handlers : Map<K, () => void> = new Map();

    constructor () {
        super ();
        this.$seal();
    }
}

/**
 * Create a children pack for each map value
 */
export class MapView<K, T> extends BaseView<K, T, MapModel<K, T>> {

    model: IValue<MapModel<K, T>>;

    /**
     * Sets up model
     */
    constructor ($ : ?MapViewPrivate<K, T>) {
        super($ || new MapViewPrivate);
        this.model = this.$ref(new MapModel);
    }



    /**
     * Saves the child handler
     */
    createChild (id : K, item : T, before : ?Fragment) : any {
        let $ : MapViewPrivate<K, T> = this.$;
        let handler = super.createChild(id, item, before);

        if (item instanceof IValue) {
            item.on(handler);
        }
        $.handlers.set(id, handler);
    }

    /**
     * Disconnects the child handler
     */
    destroyChild (id : K, item : T) {
        let $ : MapViewPrivate<K, T> = this.$;
        let handler = $.handlers.get(id);

        if (item instanceof IValue && handler) {
            item.off(handler);
        }
        $.handlers.delete(id);
        super.destroyChild(id, item);
    }

    /**
     * Handler ready event
     */
    $ready () {
        let map : MapModel<K, T> = this.model.$;

        map.forEach((value, key) => {
            this.createChild(key, value);
        });

        super.$ready();
    }

    /**
     * Handler destroy event
     */
    $destroy () {
        let $ : MapViewPrivate<K, T> = this.$;
        let map : MapModel<K, T> = this.model.$;

        map.forEach((value, key) => {
            if (value instanceof IValue) {
                const handler = $.handlers.get(key);

                if (handler) {
                    value.off(handler);
                }
            }
        })

        super.$destroy();
    }
}

