import { BaseView, BaseViewPrivate } from "./base-view";
import { MapModel } from "../models/map-model";
import { Fragment } from "../node/node";
/**
 * private part of map view
 * @class MapViewPrivate
 * @extends BaseViewPrivate
 */
export declare class MapViewPrivate<K, T> extends BaseViewPrivate<K, T> {
    /**
     * Contains update handler for each value
     * @type {Map}
     */
    handlers: Map<K, () => void>;
    constructor();
    $destroy(): void;
}
/**
 * Create a children pack for each map value
 * @class MapView
 * @extends BaseView
 */
export declare class MapView<K, T> extends BaseView<K, T, MapModel<K, T>> {
    protected $: MapViewPrivate<K, T>;
    constructor($?: MapViewPrivate<K, T>);
    createChild(id: K, item: T, before?: Fragment): any;
    destroyChild(id: K, item: T): void;
    $ready(): void;
    $destroy(): void;
}
