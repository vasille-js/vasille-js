// @flow

import {Callable} from "./interfaces/idefinition.js";
import {IValue}   from "./interfaces/ivalue.js";

import {Value}    from "./value.js";



/**
 * Constructs a data field value
 * @param rt {BaseNode} Root component
 * @param ts {BaseNode} This component
 * @param value {?*} The default value of field
 * @param func {?Callable} The function to calc filed value
 * @return {Value} A new generated value
 */
export function datify (
    rt    : any,
    ts    : any,
    value : ?any = null,
    func  : ?Callable = null
) : Value {
    if (func) {
        let v = func.func(rt, ts);

        if (v instanceof IValue) {
            return new Value(v.get());
        } else {
            return new Value(v);
        }
    } else {
        if (value instanceof IValue) {
            return new Value(value.get());
        } else {
            return new Value(value);
        }
    }
}
