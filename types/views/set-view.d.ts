import { BaseView } from "./base-view";
import { SetModel } from "../models/set-model";
/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
export declare class SetView<T> extends BaseView<T, T, SetModel<T>> {
    constructor();
    $ready(): void;
}
