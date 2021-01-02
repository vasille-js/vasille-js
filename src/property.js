// @flow
import { Callable } from "./interfaces/idefinition.js";
import { IValue }   from "./interfaces/ivalue.js";

import { Value } from "./value.js";



/**
 * Constructs a property field value
 * @param value {?any} is the initial value of field
 * @param func {?Callable} is the function to calc filed value
 * @return {IValue} Given value or new generated
 */
export function propertify (
    value : ?any     = null,
    func : ?Callable = null
) : IValue<any> {
    if (func) {
        let v = func.func();

        if (v instanceof IValue) {
            return v;
        }
        else {
            return new Value(v);
        }
    }
    else {
        if (value instanceof IValue) {
            return value;
        }
        else {
            return new Value(value);
        }
    }
}
