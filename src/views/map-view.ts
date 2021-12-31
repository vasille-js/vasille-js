import { BaseView, BaseViewPrivate } from "./base-view";
import { IValue } from "../core/ivalue";
import { MapModel } from "../models/map-model";
import { Fragment } from "../node/node";



/**
 * private part of map view
 * @class MapViewPrivate
 * @extends BaseViewPrivate
 */
export class MapViewPrivate<K, T> extends BaseViewPrivate<K, T> {
    /**
     * Contains update handler for each value
     * @type {Map}
     */
    public handlers : Map<K, () => void> = new Map();

    public constructor () {
        super ();
        this.$seal();
    }

    $destroy() {
        super.$destroy();
        this.handlers.clear();
    }
}

/**
 * Create a children pack for each map value
 * @class MapView
 * @extends BaseView
 */
export class MapView<K, T> extends BaseView<K, T, MapModel<K, T>> {
    protected $ : MapViewPrivate<K, T>;

    public constructor ($ ?: MapViewPrivate<K, T>) {
        super($ || new MapViewPrivate);
        this.model = this.$ref(new MapModel);
    }

    public createChild (id : K, item : T, before ?: Fragment) : any {
        let $ : MapViewPrivate<K, T> = this.$;
        let handler = super.createChild(id, item, before);

        if (item instanceof IValue) {
            item.on(handler);
        }
        $.handlers.set(id, handler);
    }

    public destroyChild (id : K, item : T) {
        let $ : MapViewPrivate<K, T> = this.$;
        let handler = $.handlers.get(id);

        if (item instanceof IValue && handler) {
            item.off(handler);
        }
        $.handlers.delete(id);
        super.destroyChild(id, item);
    }

    public $ready () {
        let map : MapModel<K, T> = this.model.$;

        map.forEach((value, key) => {
            this.createChild(key, value);
        });

        super.$ready();
    }

    public $destroy () {
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

        $.$destroy();
        super.$destroy();
    }
}

