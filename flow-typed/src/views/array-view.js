// @flow
import { BaseView, BaseViewPrivate } from "./base-view";
import { ArrayModel } from "../models/array-model";
import { IValue } from "../core/ivalue";
import { Fragment } from "../node/node";



declare export class ArrayViewPrivate<T> extends BaseViewPrivate<?T, T> {
    handlers : Map<T, () => void>;

    constructor () : void;
}

declare export class ArrayView<T> extends BaseView<?T, T, ArrayModel<T>> {
    model : IValue<ArrayModel<T>>;

    constructor ($ : ?ArrayViewPrivate<T>) : void;

    createChild (id : ?T, item : T, before : ?Fragment) : any;
    destroyChild (id : ?T, item : T) : void;
}
