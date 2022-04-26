import { BaseView, BSO } from "./base-view";
import { MapModel } from "../models/map-model";



/**
 * Create a children pack for each map value
 * @class MapView
 * @extends BaseView
 */
export class MapView<K, T> extends BaseView<K, T, MapModel<K, T>> {

    protected compose(input: BSO<K, T, MapModel<K, T>>) {
        super.compose(input);
        input.model.forEach((value, key) => {
            this.createChild(input, key, value);
        });
    }
}

