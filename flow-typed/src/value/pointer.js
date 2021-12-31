// @flow
import { Mirror } from "./mirror";
import { IValue } from "../core/ivalue";

declare export class Pointer<T> extends Mirror<T> {

    constructor (value : IValue<T>, forwardOnly : boolean) : void;

    point (value : IValue<T>) : void;
}
