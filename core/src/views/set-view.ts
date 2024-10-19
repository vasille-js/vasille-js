import { Fragment } from "../node/node";
import { BaseView, BaseViewOptions } from "./base-view";
import { SetModel } from "../models/set-model";

/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
export class SetView<T> extends BaseView<T, T, SetModel<T>> {
    public constructor(input: BaseViewOptions<T, T, SetModel<T>>) {
        super(input, ":set-view");
    }

    public compose() {
        super.compose();
        this.input.model.forEach(item => {
            this.createChild(this.input, item, item);
        });
        return {};
    }
}
