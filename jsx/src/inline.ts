import { Fragment, IValue, Pointer, current, userError } from "vasille";

export function readValue(v: unknown): unknown {
    return v instanceof IValue ? v.$ : v;
}

export function setValue(target: unknown, value: unknown, fallback: (v: unknown) => void) {
    if (target instanceof IValue) {
        if (target instanceof Pointer && value instanceof IValue) {
            target.$$ = value as IValue<unknown>;
        } else {
            target.$ = value;
        }
    } else {
        fallback(value);
    }
}

export function getCurrent(): Fragment {
    if (!(current instanceof Fragment)) {
        throw userError("missing parent node", "out-of-context");
    }

    return current;
}
