//@flow

import {Rebind, Value} from "../value";
import {Bind1x1, Bind1xN} from "../bind";
import type {IValue} from "./ivalue";

export type ValueType = Value | Rebind | Bind1x1 | Bind1xN;

export function isValue (v : IValue)  : boolean {
    return v instanceof Value ||
           v instanceof Rebind ||
           v instanceof Bind1x1 ||
           v instanceof Bind1xN;
}
