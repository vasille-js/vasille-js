import { BaseView } from "./base-view";
import { ObjectModel } from "../models/object-model";
/**
 * Create a children pack for each object field
 * @class ObjectView
 * @extends BaseView
 */
export declare class ObjectView<T> extends BaseView<string, T, ObjectModel<T>> {
    constructor(model: ObjectModel<T>);
    ready(): void;
}
