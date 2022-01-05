import { BaseView } from "./base-view";
import { ObjectModel } from "../models/object-model";



/**
 * Create a children pack for each object field
 * @class ObjectView
 * @extends BaseView
 */
export class ObjectView<T> extends BaseView<string, T, ObjectModel<T>> {
    public constructor () {
        super();
        this.model = this.$ref(new ObjectModel);
    }

    public $ready () {
        const obj : {[p : string] : T} = this.model.$ as any;

        for (const key in obj) {
            this.createChild(key, obj[key]);
        }

        super.$ready();
    }
}

