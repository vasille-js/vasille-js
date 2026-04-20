import { Destroyable } from "../../../core/destroyable.js";
import type { IValue } from "../../../core/ivalue.js";

/**
 * Describe a common binding logic
 * @class Binding
 */
export class Binding<T> implements Destroyable {
    public readonly rDeep: number;
    private binding: IValue<T>;
    private func!: (value: T) => void;

    /**
     * Constructs a common binding logic
     * @param value {IValue} the value to bind
     */
    public constructor(value: IValue<T>) {
        this.binding = value;
        this.rDeep = value.rDeep;
    }

    protected init(bounded: (v: T) => void) {
        this.func = bounded;
        this.binding.on(this.func);
        this.func(this.binding.V);
    }

    /**
     * Just clear bindings
     */
    public destroy(deep: number) {
        /* istanbul ignore else */
        if (this.binding.rDeep < deep) {
            this.binding.off(this.func);
        }
    }
}
