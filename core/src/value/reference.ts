import { IValue } from "../core/ivalue";
import { reportError } from "../functional/safety";

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

    /**
     * Array of handlers
     * @type {Set}
     * @readonly
     */
    protected readonly onChange: Set<(value: T) => void>;

    /**
     * @param value {any} the initial value
     */
    public constructor(value: T) {
        super();
        this.state = value;
        this.onChange = new Set();
    }

    public get $(): T {
        return this.state;
    }

    public set $(value: T) {
        if (this.state !== value) {
            this.state = value;

            this.updateDeps(value);
        }
    }

    public on(handler: (value: T) => void): void {
        this.onChange.add(handler);
    }

    public off(handler: (value: T) => void): void {
        this.onChange.delete(handler);
    }

    public destroy() {
        super.destroy();
        this.onChange.clear();
    }

    protected updateDeps(value: T) {
        this.onChange.forEach(handler => {
            try {
                handler(value);
            } catch (e) {
                reportError(e);
            }
        });
    }
}
