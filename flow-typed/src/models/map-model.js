// @flow
import { Listener } from "./listener";
import type { IModel } from "./model";



declare export class MapModel<K, T> extends Map<K, T> implements IModel {
    listener : Listener<T, K>;

    constructor (map : [K, T][]) : void;
    clear () : void;
    delete (key : any) : boolean;
    set (key : K, value : T) : this;
}

