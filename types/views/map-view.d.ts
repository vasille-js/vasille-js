import { BaseView } from "./base-view";
import { MapModel } from "../models/map-model";
/**
 * Create a children pack for each map value
 * @class MapView
 * @extends BaseView
 */
export declare class MapView<K, T> extends BaseView<K, T, MapModel<K, T>> {
    constructor(model: MapModel<K, T>);
    ready(): void;
}
