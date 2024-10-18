import type { IValue } from "../core/ivalue";
import { AcceptedTagsMap, AcceptedTagsSpec } from "../spec/react";
import { PropertiesHyphen } from "csstype";

export type AttrType<T> = IValue<T | string | null> | T | string | null | undefined;
export type StyleType<T> = T | number | number[] | IValue<string | number | number[]>;

export interface TagOptions<T extends keyof AcceptedTagsMap> {
    attr?: {
        [K in keyof AcceptedTagsSpec[T]["attrs"]]?: AttrType<AcceptedTagsSpec[T]["attrs"][K]>;
    };
    attrX?: Record<string, AttrType<number | boolean>>;
    class?: (string | IValue<string> | Record<string, boolean | IValue<boolean>>)[];
    style?: {
        [K in keyof PropertiesHyphen]: StyleType<PropertiesHyphen[K]>;
    };
    styleX?: Record<string, StyleType<string>>;

    events?: Partial<AcceptedTagsSpec[T]["events"]>;

    bind?: {
        [K in keyof AcceptedTagsMap[T]]?: IValue<AcceptedTagsMap[T][K]> | AcceptedTagsMap[T][K];
    };
    bindX?: Record<string, any>;
}
