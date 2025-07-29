import { BaseView } from "./base-view.js";
import { MapModel } from "../models/map-model.js";

/**
 * Create a children pack for each map value
 * @class MapView
 * @extends BaseView
 */
export class MapView<Node, Element, TagOptions extends object, K, T> extends BaseView<
    Node,
    Element,
    TagOptions,
    K,
    T,
    MapModel<K, T>
> {
    public compose() {
        super.compose();
        this.input.model.forEach((value, key) => {
            this.createChild(this.input, key, value);
        });
    }
}
