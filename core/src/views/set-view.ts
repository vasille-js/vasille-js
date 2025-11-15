import { IRunner } from "../node/runner.js";
import { BaseView, BaseViewOptions } from "./base-view.js";
import { SetModel } from "../models/set-model.js";

/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
export class SetView<
    Node,
    Element,
    TagOptions extends object,
    T,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends BaseView<Node, Element, TagOptions, T, T, SetModel<T>, Runner> {
    public constructor(input: BaseViewOptions<Node, Element, TagOptions, T, T, SetModel<T>, Runner>, runner: Runner) {
        super(input, runner);
    }

    public override compose() {
        super.compose();
        this.model.forEach(item => {
            this.createChild(item, item);
        });
    }
}
