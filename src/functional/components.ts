import { Fragment } from "../node/node";
import { IValue } from "../core/ivalue";
import { current } from "../core/core";

export function text(text : string | IValue<string>) {
    if (!(current instanceof Fragment)) throw 'missing current node';
    current.text(text);
}

export function debug(text : IValue<string>) {
    if (!(current instanceof Fragment)) throw 'missing current node';
    current.debug(text);
}

export function predefine<T extends (...args: any) => any>(slot : T | null | undefined, predefined : T) : T {
    return slot || predefined;
}
