// @flow
import { BaseView, BaseViewPrivate } from "./base-view";
import { IValue } from "../core/ivalue";
import { MapModel } from "../models/map-model";
import { Fragment } from "../node/node";



declare export class MapViewPrivate<K, T> extends BaseViewPrivate<K, T> {
    handlers : Map<K, () => void>;

    constructor () : void;
}

declare export class MapView<K, T> extends BaseView<K, T, MapModel<K, T>> {

    model: IValue<MapModel<K, T>>;
    constructor ($ : ?MapViewPrivate<K, T>) : void;

    createChild (id : K, item : T, before : ?Fragment) : any;
    destroyChild (id : K, item : T) : void;
}

