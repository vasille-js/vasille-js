//@flow

import type {IValue}   from "./ivalue";

import {Bind1, BindN}  from "../bind";
import {Rebind, Value} from "../value";



export type ValueType = Value | Rebind | Bind1 | BindN;

export function isValue (v : IValue)  : boolean {
    return v instanceof Value ||
           v instanceof Rebind ||
           v instanceof Bind1 ||
           v instanceof BindN;
}
