import { BaseView, BaseViewPrivate } from "./base-view";
import { ArrayModel } from "../models/array-model";
import { Fragment } from "../node/node";



/**
 * Represents a view of an array model
 * @class ArrayView
 * @extends BaseView
 */
export class ArrayView<T> extends BaseView<T, T, ArrayModel<T>> {
    public constructor () {
        super();

        this.model = new ArrayModel;
        this.$seal();
    }

    public createChild (id : T, item : T, before ?: Fragment) : any {
        super.createChild(item, item,before || this.$.nodes.get(id));
    }

    public $ready () {
        this.model.forEach(item =>  {
            this.createChild(item, item);
        })

        super.$ready();
    }
}
