// @flow
import { Listener } from "./listener";
import type { IModel } from "./model";



declare export class SetModel<T> extends Set<T> implements IModel {
    listener : Listener<T, T>;

    constructor (set : T[]) : void;
    add (value : T) : this;
    clear () : this;
    delete (value : T) : boolean;
}

