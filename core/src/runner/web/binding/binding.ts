import { Destroyable } from "../../../core/destroyable.js";
import type { IValue } from "../../../core/ivalue.js";

/**
 * Describe a common binding logic
 * @class Binding
 */
export class Binding<T> implements Destroyable {
    private binding: IValue<T>;
    private func: (value: T) => void;

    /**
     * Constructs a common binding logic
     * @param value {IValue} the value to bind
     */
    public constructor(value: IValue<T>) {
        this.binding = value;
    }

    protected init(bounded: (v: T) => void) {
        this.func = bounded;
        this.binding.on(this.func);
        this.func(this.binding.V);
    }

    /**
     * Just clear bindings
     */
    public destroy() {
        this.binding.off(this.func);
    }
}
