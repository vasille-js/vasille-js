// @flow
import { BaseView, BaseViewPrivate } from "./base-view";
import { ObjectModel } from "../models/object-model";
import { Fragment } from "../node/node";



declare export class ObjectViewPrivate<T> extends BaseViewPrivate<string, T> {
    handlers : { [key : string] : () => void };

    constructor () : void;
}

declare export class ObjectView<T> extends BaseView<string, T, ObjectModel<T>> {
    constructor ($ : ?ObjectViewPrivate<T>) : void;

    createChild (id : string, item : T, before : ?Fragment) : any;
    destroyChild (id : string, item : T) : void;
}

