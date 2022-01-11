// @flow
import { BaseView, BaseViewPrivate } from "./base-view";
import { ObjectModel } from "../models/object-model";
import { Fragment } from "../node/node";



declare export class ObjectView<T> extends BaseView<string, T, ObjectModel<T>> {
    constructor () : void;
}

