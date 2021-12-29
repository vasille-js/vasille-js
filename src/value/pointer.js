// @flow
import { Mirror } from "./mirror";
import { IValue } from "../core/ivalue";

export class Pointer<T> extends Mirror<T> {

    constructor (value : IValue<T>, forwardOnly : boolean = false) {
        super (value, forwardOnly);
    }

    point (value : IValue<T>) {
        if (this.pointedValue !== value) {
            this.disable ();
            this.pointedValue = value;
            this.enable ();
        }
    }
}
