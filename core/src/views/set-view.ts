import { Fragment } from "../node/node";
import { BaseView, BaseViewOptions } from "./base-view";
import { SetModel } from "../models/set-model";

/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
export class SetView<T> extends BaseView<T, T, SetModel<T>> {
    public constructor(parent: Fragment, input: BaseViewOptions<T, T, SetModel<T>>) {
        super(parent, input, ":set-view");
    }

    public compose() {
        const set: SetModel<T> = this.input.model;

        set.forEach(item => {
            this.createChild(this.input, item, item);
        });
        return {};
    }
}
