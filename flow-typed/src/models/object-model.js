// @flow
import { Listener } from "./listener";
import type { IModel } from "./model";



declare export class ObjectModel<T> extends Object implements IModel {
    listener : Listener<T, string>;

    constructor (obj : { [p : string] : T }) : void;
    get (key : string) : T;
    set (key : string, v : T) : this;
    delete (key : string) : void;
}

