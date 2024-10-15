import type { IValue } from "../core/ivalue";
import { AcceptedTagsMap, AcceptedTagsSpec } from "../spec/react";
import type { Fragment } from "../node/node";

export interface FragmentOptions<T = unknown> {
    callback?: (data: T) => void;
    slot?: (node: Fragment, ...args: any[]) => void;
}

export type AttrType<T> = IValue<T | string | null> | T | string | null | undefined;

export interface TagOptions<T extends keyof AcceptedTagsMap> extends FragmentOptions {
    attr?: {
        [K in keyof AcceptedTagsSpec[T]["attrs"]]?: AttrType<AcceptedTagsSpec[T]["attrs"][K]>;
    } & Record<string, AttrType<number | boolean>>;
    class?: (string | IValue<string> | Record<string, boolean | IValue<boolean>>)[];
    style?: Record<string, string | IValue<string> | [number | string | IValue<number | string>, string]>;

    events?: Partial<AcceptedTagsSpec[T]["events"]>;

    set?: Partial<AcceptedTagsMap[T]> & Record<string, any>;
    bind?: {
        [K in keyof AcceptedTagsMap[T]]?: IValue<AcceptedTagsMap[T][K]>;
    } & Record<string, IValue<any>>;
}
