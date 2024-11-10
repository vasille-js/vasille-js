import { Fragment, IValue, Reactive, Reference } from "vasille";

export function awaited<T>(node: Reactive, target: Promise<T> | (() => Promise<T>)) {
    const value = node.ref<unknown>(undefined);
    const err = node.ref<unknown>(undefined);
    let current: Promise<T> | (() => Promise<T>) | undefined = target;

    if (typeof current === "function") {
        try {
            current = current();
        } catch (e) {
            current = undefined;
            err.$ = e;
        }
    }

    if (current instanceof Promise) {
        current.then(result => (value.$ = result)).catch(e => (err.$ = e));
    } else {
        value.$ = current;
    }

    return [err, value];
}

export function ensureIValue<T>(node: Reactive, value: T | IValue<T>): IValue<T> {
    return value instanceof IValue ? value : node.ref(value);
}
