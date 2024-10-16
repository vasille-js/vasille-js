import { IValue } from "vasille";

export function dereference(v: unknown): unknown {
    return v instanceof IValue ? v.$ : v;
}
