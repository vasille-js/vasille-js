import { IValue, Reference, userError } from "vasille";
import { internal } from "./internal";
import { getCurrent } from "./inline";

export function forward(value: unknown) {
    if (value instanceof IValue) {
        return getCurrent().forward(value as IValue<unknown>);
    }

    return value;
}

export function point(value: unknown) {
    const current = getCurrent();

    if (value instanceof IValue) {
        return current?.point(value as IValue<unknown>);
    }

    return current?.point(current.ref(value));
}

export function calculate(f: (...args: unknown[]) => unknown, ...args: unknown[]) {
    return internal.expr(f, args);
}

export function watch(f: (...args: unknown[]) => void, ...args: unknown[]) {
    return internal.expr(f, args);
}

export function awaited<T>(target: Promise<T>) {
    const current = getCurrent();
    const value = current.ref<unknown>(undefined);
    const err = current.ref<unknown>(undefined);

    target.then(result => (value.$ = result)).catch(e => (err.$ = e));

    return [err, value];
}

export function ensureIValue<T>(value: T | IValue<T>): IValue<T> {
    return value instanceof IValue ? value : getCurrent().ref(value);
}
