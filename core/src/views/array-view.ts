import { BaseView, BaseViewOptions } from "./base-view.js";
import { ArrayModel } from "../models/array-model.js";
import { Fragment } from "../node/node.js";

/**
 * Represents a view of an array model
 * @class ArrayView
 * @extends BaseView
 */
export class ArrayView<Node, Element, TagOptions extends object, T> extends BaseView<
    Node,
    Element,
    TagOptions,
    T,
    T,
    ArrayModel<T>
> {
    public createChild(
        input: BaseViewOptions<Node, Element, TagOptions, T, T, ArrayModel<T>>,
        id: T,
        item: T,
        before?: Fragment<Node, Element, TagOptions>,
    ): any {
        super.createChild(input, item, item, before || this.nodes.get(id));
    }

    public compose() {
        super.compose();
        this.input.model.forEach(item => {
            this.createChild(this.input, item, item);
        });
    }
}
