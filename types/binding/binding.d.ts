import { Destroyable } from "../core/destroyable";
import type { IValue } from "../core/ivalue";
/**
 * Describe a common binding logic
 * @class Binding
 * @extends Destroyable
 */
export declare class Binding<T> extends Destroyable {
    private binding;
    private func;
    /**
     * Constructs a common binding logic
     * @param value {IValue} the value to bind
     */
    constructor(value: IValue<T>);
    protected init(bounded: (v: T) => void): void;
    /**
     * Just clear bindings
     */
    destroy(): void;
}
