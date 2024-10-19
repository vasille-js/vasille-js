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
    public constructor(value: IValue<T>, forwardOnly = false) {
        super(value, forwardOnly);
    }

    /**
     * Point a new ivalue
     * @param value {IValue} value to point
     */
    public set $$(value: IValue<T>) {
        if (this.value !== value) {
            this.value.off(this.handler);
            this.value = value;
            this.value.on(this.handler);
            this.handler(value.$);
        }
    }
}
