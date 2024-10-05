import { BaseView, BSO } from "./base-view";
import { ArrayModel } from "../models/array-model";
import { Fragment } from "../node/node";



/**
 * Represents a view of an array model
 * @class ArrayView
 * @extends BaseView
 */
export class ArrayView<T> extends BaseView<T, T, ArrayModel<T>> {

    public createChild (input : BSO<T, T, ArrayModel<T>>, id : T, item : T, before ?: Fragment) : any {
        super.createChild(input, item, item,before || this.$.nodes.get(id));
    }

    protected compose(input: BSO<T, T, ArrayModel<T>>) {
        super.compose(input);
        input.model.forEach(item => {
            this.createChild(input, item, item);
        });
        return {};
    }
}
