// @flow

import type {Callable} from "./interfaces/idefinition";

import {Core}    from "./interfaces/core";
import {Value}   from "./value";
import {isValue} from "./interfaces/types";



/**
 * Constructs a data field value
 * @param rt {Core} is root component
 * @param ts {Core} is this component
 * @param value {?any} is the default value of field
 * @param func {?Callable} is the function to calc filed value
 */
export function datify (
    rt    : Core,
    ts    : Core,
    value : ?any = null,
    func  : ?Callable = null
) : Value {
    if (func) {
        let v = func.func(rt, ts);

        if (isValue(v)) {
            return new Value(v.get());
        } else {
            return new Value(v);
        }
    } else {
        if (value && isValue(value)) {
            return new Value(value.get());
        } else {
            return new Value(value);
        }
    }
}
