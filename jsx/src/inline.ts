import { IValue } from "vasille";

export function dereference(v: unknown): unknown {
    return v instanceof IValue ? v.$ : v;
}

export function assign(target: unknown, value: unknown, fallback: (v: unknown) => void) {
    if (target instanceof IValue) {
        target.$ = value;
    } else {
        fallback(value);
    }
}
