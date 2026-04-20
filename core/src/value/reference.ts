import { Reactive } from "../core/core.js";
import { IValue } from "../core/ivalue.js";
import { reportError } from "../functional/safety.js";

function run<T>(fn: (value: T) => void, value: T) {
    try {
        fn(value);
    } catch (e) {
        reportError(e);
    }
}

/**
 * Declares a notifiable value
 * @class Reference
 * @extends IValue
 */
export class Reference<T> extends IValue<T> {
    /**
     * The encapsulated value
     * @type {*}
     */
    protected state: T;

    protected handler1?: (value: T) => void;
    protected handler2?: (value: T) => void;

    /**
     * Array of handlers
     * @type {Set}
     * @readonly
     */
    protected onChange?: Set<(value: T) => void>;

    /**
     * @param value {any} the initial value
     */
    public constructor(value: T, ctx?: Reactive) {
        super(ctx?.sDeep ?? 0);
        this.state = value;
    }

    public get V(): T {
        return this.state;
    }

    public set V(value: T) {
        if (this.state !== value) {
            const { onChange, handler1, handler2 } = this;

            this.state = value;

            if (onChange) {
                onChange.forEach(handler => {
                    run(handler, value);
                });
            } else if (handler1) {
                run(handler1, value);

                if (handler2) {
                    run(handler2, value);
                }
            }
        }
    }

    public on(handler: (value: T) => void): void {
        if (this.onChange) {
            this.onChange.add(handler);
        } else {
            if (!this.handler1) {
                this.handler1 = handler;
            } else if (!this.handler2) {
                this.handler2 = handler;
            } else {
                this.onChange = new Set([this.handler1, this.handler2, handler]);
                this.handler1 = undefined;
                this.handler2 = undefined;
            }
        }
    }

    public off(handler: (value: T) => void): void {
        if (this.onChange) {
            this.onChange.delete(handler);
        } else {
            if (this.handler1 === handler) {
                this.handler1 = this.handler2;
                this.handler2 = undefined;
            } else if (this.handler2 === handler) {
                this.handler2 = undefined;
            }
        }
    }
}
