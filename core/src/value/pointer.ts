import { IValue } from "../core/ivalue.js";
import { Reference } from "./reference.js";

/**
 * Forward only link type
 * @class Forward
 * @extends Reference
 */
export class Forward<T> extends Reference<T> {
    /**
     * forwarded value
     * @type IValue
     */
    protected target: IValue<T>;

    /**
     * Handler to receive updates from forwarded value
     */
    protected readonly handler: (value: T) => void;

    /**
     * Constructs a value forwarder
     * @param value {IValue} is source of forwarded data
     */
    public constructor(value: IValue<T>) {
        super(value.V);
        this.handler = (v: T) => {
            this.V = v;
        };
        this.target = value;

        value.on(this.handler);
    }

    public destroy() {
        this.target.off(this.handler);
        super.destroy();
    }
}

/**
 * Make a value read-only
 * @class ReadOnly
 * @extends Forward
 */
export class ReadOnly<T> extends Forward<T> {
    public set V(v: T) {
        void v;
        throw new Error("This is a read-only value");
    }
}

/**
 * Backward only link type
 * @class Backward
 * @extends Reference
 */
export class Backward<T> extends Reference<T> {
    /**
     * target, which receive the updates
     * @type IValue
     */
    protected target: IValue<T>;

    /**
     * Constructs a value backward stream
     * @param value {IValue} target, which receive the updates
     */
    public constructor(value: IValue<T>) {
        super(value.V);
        this.target = value;
    }

    public set V(value: T) {
        super.V = value;
        this.target.V = value;
    }
}
