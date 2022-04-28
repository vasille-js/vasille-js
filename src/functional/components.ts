import { Fragment } from "../node/node";
import { IValue } from "../core/ivalue";
import { current } from "../core/core";
import {userError} from "../core/errors";

export function text(text : string | IValue<string>) {
    if (!(current instanceof Fragment)) throw userError('missing parent node', 'out-of-context');;
    current.text(text);
}

export function debug(text : IValue<string>) {
    if (!(current instanceof Fragment)) throw userError('missing parent node', 'out-of-context');
    current.debug(text);
}

export function predefine<T extends (...args: any) => any>(slot : T | null | undefined, predefined : T) : T {
    return slot || predefined;
}
