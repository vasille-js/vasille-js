// @flow
import { Mirror } from "./mirror";
import { IValue } from "../core/ivalue";

export class Pointer<T> extends Mirror<T> {

    public constructor (value : IValue<T>, forwardOnly : boolean = false) {
        super (value, forwardOnly);
    }

    public point (value : IValue<T>) {
        if (this.pointedValue !== value) {
            this.disable ();
            this.pointedValue = value;
            this.enable ();
        }
    }
}
