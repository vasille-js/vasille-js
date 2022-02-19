import { IValue } from "../core/ivalue";
import { Reference } from "./reference";
/**
 * Declares a notifiable bind to a value
 * @class Mirror
 * @extends IValue
 * @version 2
 */
export declare class Mirror<T> extends Reference<T> {
    /**
     * pointed value
     * @type IValue
     */
    protected pointedValue: IValue<T>;
    /**
     * Collection of handlers
     * @type Set
     */
    private readonly handler;
    /**
     * Ensure forward only synchronization
     */
    forwardOnly: boolean;
    /**
     * Constructs a notifiable bind to a value
     * @param value {IValue} is initial value
     * @param forwardOnly {boolean} ensure forward only synchronization
     */
    constructor(value: IValue<T>, forwardOnly?: boolean);
    get $(): T;
    set $(v: T);
    enable(): void;
    disable(): void;
    destroy(): void;
}
