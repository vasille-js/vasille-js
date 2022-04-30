import { IValue } from "../core/ivalue";
import { Pointer } from "../value/pointer";
import { current } from "../core/core";
import { KindOfIValue } from "../value/expression";

export function ref<T>(value : T) : [IValue<T>, (value : T) => void] {
    const ref = current.ref(value);

    return [ref, (value : T) => ref.$ = value];
}

export function mirror<T>(value : IValue<T>) {
    return current.mirror(value);
}

export function forward<T>(value : IValue<T>) {
    return current.forward(value);
}

export function point<T>(value : IValue<T>) {
    return current.point(value);
}

export function expr<T, Args extends unknown[]> (
    func : (...args : Args) => T,
    ...values : KindOfIValue<Args>
) : IValue<T> {
    return current.expr(func, ...values);
}

export function watch<Args extends unknown[]> (
    func : (...args : Args) => void,
    ...values : KindOfIValue<Args>
) : void {
    current.watch(func, ...values);
}

export function valueOf<T>(value : IValue<T>) : T {
    return value.$;
}

export function setValue<T>(ref : IValue<T>, value : IValue<T> | T) {
    if (ref instanceof Pointer && value instanceof IValue) {
        ref.$$ = value;
    }
    else {
        ref.$ = value instanceof IValue ? value.$ : value;
    }
}
