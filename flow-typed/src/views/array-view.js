// @flow
import { BaseView } from "./base-view";
import { ArrayModel } from "../models/array-model";
import { Fragment } from "../node/node";



declare export class ArrayView<T> extends BaseView<?T, T, ArrayModel<T>> {
    constructor () : void;
    createChild (id : ?T, item : T, before : ?Fragment) : any;
}
