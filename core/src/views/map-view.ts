import { IRunner } from "../node/runner.js";
import { BaseView } from "./base-view.js";
import { MapModel } from "../models/map-model.js";

/**
 * Create a children pack for each map value
 * @class MapView
 * @extends BaseView
 */
export class MapView<
    Node,
    Element,
    TagOptions extends object,
    K,
    T,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends BaseView<Node, Element, TagOptions, K, T, MapModel<K, T>, Runner> {
    public override compose() {
        super.compose();
        this.model.forEach((value, key) => {
            this.createChild(key, value);
        });
    }
}
