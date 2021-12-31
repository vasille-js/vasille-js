import { Mirror } from "./mirror";
import { IValue } from "../core/ivalue";

/**
 * r/w pointer to a value
 * @class Pointer
 * @extends Mirror
 */
export class Pointer<T> extends Mirror<T> {

    /**
     * @param value {IValue} value to point
     * @param forwardOnly {boolean} forward only data flow
     */
    public constructor (value : IValue<T>, forwardOnly = false) {
        super (value, forwardOnly);
    }

    /**
     * Point a new ivalue
     * @param value {IValue} value to point
     */
    public point (value : IValue<T>) {
        if (this.pointedValue !== value) {
            this.disable ();
            this.pointedValue = value;
            this.enable ();
        }
    }
}
