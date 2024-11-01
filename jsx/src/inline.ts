import { Fragment, IValue, Pointer, Reactive, userError } from "vasille";

export function readValue<T>(v: T | IValue<T>): T {
    return v instanceof IValue ? v.$ : v;
}

export function setValue(target: unknown, value: unknown, fallback?: (v: unknown) => void) {
    if (target instanceof IValue) {
        if (target instanceof Pointer && value instanceof IValue) {
            target.$$ = value as IValue<unknown>;
        } else {
            target.$ = value instanceof IValue ? value.$ : value;
        }
    } else {
        fallback?.(value);
    }
}

export function asReactive(node: unknown): Reactive {
    if (!(node instanceof Reactive)) {
        throw userError("missing context", "out-of-context");
    }

    return node;
}
