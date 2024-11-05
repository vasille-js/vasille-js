import { Fragment, IValue, Reactive, Reference } from "vasille";

export function forward(node: Reactive, value: unknown) {
    if (value instanceof IValue) {
        return node.forward(value as IValue<unknown>);
    }

    return value;
}

export function awaited<T>(node: Reactive, target: Promise<T> | (() => Promise<T>)) {
    const value = node.ref<unknown>(undefined);
    const err = node.ref<unknown>(undefined);

    if (typeof target === "function") {
        try {
            target = target();
        } catch (e) {
            err.$ = e;
        }
    }

    if (target instanceof Promise) {
        target.then(result => (value.$ = result)).catch(e => (err.$ = e));
    } else {
        value.$ = target;
    }

    return [err, value];
}

export function ensureIValue<T>(node: unknown, value: T | IValue<T>): IValue<T> {
    return value instanceof IValue ? value : node instanceof Fragment ? node.ref(value) : new Reference(value);
}
