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
    private $value: T;

    /**
     * Array of handlers
     * @type {Set}
     * @readonly
     */
    private readonly $onchange: Set<(value: T) => void>;

    /**
     * @param value {any} the initial value
     */
    public constructor(value: T) {
        super(true);
        this.$value = value;
        this.$onchange = new Set();
        this.$seal();
    }

    public get $(): T {
        return this.$value;
    }

    public set $(value: T) {
        if (this.$value !== value) {
            this.$value = value;

            if (this.isEnabled) {
                this.$updateDeps(value);
            }
        }
    }

    public $enable(): void {
        if (!this.isEnabled) {
            this.$updateDeps(this.$value);
            this.isEnabled = true;
        }
    }

    public $disable(): void {
        this.isEnabled = false;
    }

    public $on(handler: (value: T) => void): void {
        this.$onchange.add(handler);
    }

    public $off(handler: (value: T) => void): void {
        this.$onchange.delete(handler);
    }

    public $destroy() {
        super.$destroy();
        this.$onchange.clear();
    }

    protected $updateDeps(value: T) {
        this.$onchange.forEach(handler => {
            try {
                handler(value);
            } catch (e) {
                reportError(e);
            }
        });
    }
}
