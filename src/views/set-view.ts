import { BaseView, BaseViewPrivate, BSO } from "./base-view";
import { SetModel } from "../models/set-model";



/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
export class SetView<T> extends BaseView<T, T, SetModel<T>> {

    protected compose(input: BSO<T, T, SetModel<T>>) {
        super.compose(input);

        const set : SetModel<T> = input.model;

        set.forEach(item => {
            this.createChild(input, item, item);
        });
    }
}

