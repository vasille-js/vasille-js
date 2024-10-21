import { Fragment, IValue, Pointer, userError } from "vasille";

export function readValue(v: unknown): unknown {
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

export function asFragment(node: unknown): Fragment {
    if (!(node instanceof Fragment)) {
        throw userError("missing context", "out-of-context");
    }

    return node;
}
