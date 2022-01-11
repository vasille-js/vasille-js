// @flow
import { BaseView, BaseViewPrivate } from "./base-view";
import { SetModel } from "../models/set-model";
import { Fragment } from "../node/node";




declare export class SetView<T> extends BaseView<T, T, SetModel<T>> {
    constructor () : void;
}

