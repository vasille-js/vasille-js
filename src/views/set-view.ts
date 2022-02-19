import { BaseView, BaseViewPrivate } from "./base-view";
import { SetModel } from "../models/set-model";



/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
export class SetView<T> extends BaseView<T, T, SetModel<T>> {

    public constructor (model : SetModel<T>) {
        super();
        this.model = model;
    }

    public ready () {
        const $ : BaseViewPrivate<T, T> = this.$;
        const set : SetModel<T> = this.model;

        set.forEach(item => {
            $.app.run.callCallback(() => {
                this.createChild(item, item);
            });
        });

        super.ready();
    }
}

