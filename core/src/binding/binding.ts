import { Destroyable } from "../core/destroyable";
import type { IValue } from "../core/ivalue";

/**
 * Describe a common binding logic
 * @class Binding
 * @extends Destroyable
 */
export class Binding<T> extends Destroyable {
    private binding: IValue<T>;
    private func: (value: T) => void;

    /**
     * Constructs a common binding logic
     * @param value {IValue} the value to bind
     */
    public constructor(value: IValue<T>) {
        super();
        this.binding = value;
    }

    protected init(bounded: (v: T) => void) {
        this.func = bounded;
        this.binding.on(this.func);
        this.func(this.binding.$);
    }

    /**
     * Just clear bindings
     */
    public destroy() {
        this.binding.off(this.func);
        super.destroy();
    }
}
