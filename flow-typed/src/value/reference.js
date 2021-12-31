// @flow
import { IValue } from "../core/ivalue";



declare export class Reference<T> extends IValue<T> {
    value : T;
    onchange : Set<(value : T) => void>;

    constructor (value : T) : void;

    get $ () : T;
    set $ (value : T) : this;

    enable () : this;
    disable () : this;
    on (handler : (value : T) => void) : this;
    off (handler : (value : T) => void) : this;
}

