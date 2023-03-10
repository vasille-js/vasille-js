import { BaseView, BSO } from "./base-view";
import { ObjectModel } from "../models/object-model";



/**
 * Create a children pack for each object field
 * @class ObjectView
 * @extends BaseView
 */
export class ObjectView<T> extends BaseView<string, T, ObjectModel<T>> {

    protected compose(input: BSO<string, T, ObjectModel<T>>) {
        super.compose(input);

        const obj = input.model.values;

        for (const key in obj) {
            this.createChild(input, key, obj[key]);
        }

        super.ready();
        return {};
    }
}

