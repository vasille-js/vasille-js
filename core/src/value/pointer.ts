import { IValue } from "../core/ivalue";
import { Reference } from "./reference";

/**
 * r/w pointer to a value
 * @class Pointer
 * @extends IValue
 */
export class Pointer<T> extends IValue<T> {
    /**
     * pointed value
     * @type IValue
     */
    protected target: IValue<T> | null;
    protected reference: IValue<T>;

    /**
     * Collection of handlers
     * @type Set
     */
    protected readonly handler: (value: T) => void;

    /**
     * Constructs a notifiable bind to a value
     * @param value {IValue} is initial valu
     */
    public constructor(value: IValue<T>) {
        super();
        this.handler = (v: T) => {
            this.reference.$ = v;
        };
        this.target = value;
        this.reference = new Reference(value.$);

        value.on(this.handler);
    }

    public get $(): T {
        return this.reference.$;
    }

    public set $(v: T) {
        this.target?.off(this.handler);
        this.target = null;
        this.reference.$ = v;
    }

    public get $$(): T {
        return this.reference.$;
    }

    public set $$(v: T | IValue<T>) {
        if (v instanceof IValue) {
            if (this.target !== v) {
                this.disconnectTarget();
                this.target = v;
                this.target.on(this.handler);
                this.reference.$ = v.$;
            }
        } else {
            this.$ = v;
        }
    }

    public on(handler: (value: T) => void) {
        this.reference.on(handler);
    }

    public off(handler: (value: T) => void) {
        this.reference.off(handler);
    }

    public destroy() {
        this.target?.off(this.handler);
        this.reference.destroy();
        super.destroy();
    }

    protected disconnectTarget() {
        this.target?.off(this.handler);
    }
}

export class OwningPointer<T> extends Pointer<T> {
    public destroy() {
        this.target?.destroy();
        super.destroy();
    }

    protected disconnectTarget() {
        this.target?.destroy();
    }
}
