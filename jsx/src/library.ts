import { Fragment, IValue, Reference } from "vasille";
import { asReactive } from "./inline";
import { internal } from "./internal";

export function forward(node: unknown, value: unknown) {
    if (value instanceof IValue) {
        return asReactive(node).forward(value as IValue<unknown>);
    }

    return value;
}

export function point(node: unknown, value: unknown) {
    const current = asReactive(node);

    if (value instanceof IValue) {
        return current.point(value as IValue<unknown>);
    }

    return current.point(current.ref(value));
}

export function calculate(node: unknown, f: (...args: unknown[]) => unknown, ...args: unknown[]) {
    return internal.expr(node, f, args);
}

export function watch(node: unknown, f: (...args: unknown[]) => void, ...args: unknown[]) {
    return internal.expr(node, f, args);
}

export function awaited<T>(node: unknown, target: Promise<T> | (() => Promise<T>)) {
    const current = asReactive(node);
    const value = current.ref<unknown>(undefined);
    const err = current.ref<unknown>(undefined);

    if (!(target instanceof Promise)) {
        target = target();
    }

    target.then(result => (value.$ = result)).catch(e => (err.$ = e));

    return [err, value];
}

export function ensureIValue<T>(node: unknown, value: T | IValue<T>): IValue<T> {
    return value instanceof IValue ? value : node instanceof Fragment ? node.ref(value) : new Reference(value);
}
