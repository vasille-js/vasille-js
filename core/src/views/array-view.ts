import { IRunner } from "../node/runner.js";
import { BaseView, BaseViewOptions } from "./base-view.js";
import { ArrayModel } from "../models/array-model.js";
import { Fragment } from "../node/node.js";

/**
 * Represents a view of an array model
 * @class ArrayView
 * @extends BaseView
 */
export class ArrayView<
    Node,
    Element,
    TagOptions extends object,
    T,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends BaseView<Node, Element, TagOptions, T, T, ArrayModel<T>, Runner> {
    public override createChild(id: T, item: T, before?: Fragment<Node, Element, TagOptions, Runner>): any {
        super.createChild(item, item, before || this.nodes.get(id));
    }

    public override compose() {
        super.compose();
        this.model.forEach(item => {
            this.createChild(item, item);
        });
    }
}
