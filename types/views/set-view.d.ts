import { BaseView, BSO } from "./base-view";
import { SetModel } from "../models/set-model";
/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
export declare class SetView<T> extends BaseView<T, T, SetModel<T>> {
    protected compose(input: BSO<T, T, SetModel<T>>): void;
}
