// @flow
import { BaseView, BaseViewPrivate } from "./base-view";
import { SetModel } from "../models/set-model";
import { Fragment } from "../node/node";



declare export class SetViewPrivate<T> extends BaseViewPrivate<null, T> {
    handlers : Map<T, () => void>;

    constructor () : void;
}

declare export class SetView<T> extends BaseView<null, T, SetModel<T>> {
    constructor ($ : ?SetViewPrivate<T>) : void;

    createChild (id : null, item : T, before : ?Fragment) : any;
    destroyChild (id : null, item : T) : void;
}

