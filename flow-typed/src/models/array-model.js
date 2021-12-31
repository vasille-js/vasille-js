// @flow
import { Listener } from "./listener";
import type { IModel } from "./model";



declare export class ArrayModel<T> extends Array<T> implements IModel {
    listener : Listener<T, ?T>;
    constructor (data : Array<T>) : void;
    get last () : ?T;
    fill (value : T, start : ?number, end : ?number) : this;
    pop () : T;
    push (...items : Array<T>) : number;
    shift () : T;
    splice (
        start : number,
        deleteCount : ?number,
        ...items : Array<T>
    ) : ArrayModel<T>;
    unshift (...items : Array<T>) : number;
    append (v : T) : this;
    clear () : this;
    insert (index : number, v : T) : this;
    prepend (v : T) : this;
    removeAt (index : number) : this;
    removeFirst () : this;
    removeLast () : this;
    removeOne (v : T) : this;
}

