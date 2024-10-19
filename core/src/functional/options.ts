import type { IValue } from "../core/ivalue";

export type AttrType<T> = IValue<T | string | null> | T | string | null | undefined;
export type StyleType<T> = T | number | number[] | IValue<string | number | number[]>;

export interface TagOptions {
    attr?: Record<string, AttrType<number | boolean>>;
    class?: (string | IValue<string> | Record<string, boolean | IValue<boolean>>)[];
    style?: Record<string, StyleType<string>>;
    events?: Record<string, (...args: unknown[]) => unknown>;
    bind?: Record<string, any>;
}
