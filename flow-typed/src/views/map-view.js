// @flow
import { BaseView } from "./base-view";
import { MapModel } from "../models/map-model";



declare export class MapView<K, T> extends BaseView<K, T, MapModel<K, T>> {
    constructor () : void;
}

