import { Mirror } from "./mirror";
import { IValue } from "../core/ivalue";
/**
 * r/w pointer to a value
 * @class Pointer
 * @extends Mirror
 */
export declare class Pointer<T> extends Mirror<T> {
    /**
     * @param value {IValue} value to point
     * @param forwardOnly {boolean} forward only data flow
     */
    constructor(value: IValue<T>, forwardOnly?: boolean);
    /**
     * Point a new ivalue
     * @param value {IValue} value to point
     */
    point(value: IValue<T>): void;
}
