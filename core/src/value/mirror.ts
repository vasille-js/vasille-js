import { IValue } from "../core/ivalue";
import { Reference } from "./reference";

/**
 * Declares a notifiable bind to a value
 * @class Mirror
 * @extends IValue
 * @version 2
 */
export class Mirror<T> extends Reference<T> {
    /**
     * pointed value
     * @type IValue
     */
    protected value: IValue<T>;

    /**
     * Collection of handlers
     * @type Set
     */
    protected readonly handler: (value: T) => void;

    /**
     * Ensure forward only synchronization
     */
    public forward: boolean;

    /**
     * Constructs a notifiable bind to a value
     * @param value {IValue} is initial value
     * @param forwardOnly {boolean} ensure forward only synchronization
     */
    public constructor(value: IValue<T>, forwardOnly = false) {
        super(value.$);
        this.handler = (v: T) => {
            this.$ = v;
        };
        this.value = value;
        this.forward = forwardOnly;

        value.on(this.handler);
    }

    public get $(): T {
        // this is a ts bug
        // eslint-disable-next-line
        // @ts-ignore
        return super.$;
    }

    public set $(v: T) {
        if (!this.forward) {
            this.value.$ = v;
        }
        // this is a ts bug
        // eslint-disable-next-line
        // @ts-ignore
        super.$ = v;
    }

    public destroy() {
        this.value.off(this.handler);
        super.destroy();
    }
}
