import { Runner } from "../node/runner.js";
import { BaseView, BaseViewOptions } from "./base-view.js";
import { SetModel } from "../models/set-model.js";

/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
export class SetView<Node, Element, TagOptions extends object, T> extends BaseView<
    Node,
    Element,
    TagOptions,
    T,
    T,
    SetModel<T>
> {
    public constructor(
        input: BaseViewOptions<Node, Element, TagOptions, T, T, SetModel<T>>,
        runner: Runner<Node, Element, TagOptions>,
    ) {
        super(input, runner, ":set-view");
    }

    public compose() {
        super.compose();
        this.input.model.forEach(item => {
            this.createChild(this.input, item, item);
        });
        return {};
    }
}
