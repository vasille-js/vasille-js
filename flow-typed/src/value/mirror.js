// @flow
import { IValue } from "../core/ivalue";
import { Reference } from "./reference";



declare export class Mirror<T> extends Reference<T> {
    pointedValue : IValue<T>;
    handler : (value : T) => void;
    forwardOnly : boolean;

    constructor (value : IValue<T>, forwardOnly : boolean) : void;
}
