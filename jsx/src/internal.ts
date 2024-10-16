import { current, IValue, Reference } from "vasille";
import { Expression } from "./expression";
import { assign, dereference } from "./inline";
import { propertyExtractor, readProperty, writeValue } from "./objects";

export const internal = {
    /**
     * Create reference, use only in compose functions
     */
    ref(v: unknown): unknown {
        if (v instanceof IValue) {
            return v;
        }

        return current.ref(v);
    },
    /**
     * Create module reference, can be used anywhere
     */
    var(v: unknown): unknown {
        if (v instanceof IValue) {
            return new Reference(v.$);
        }

        return new Reference(v);
    },
    /**
     * Create expression
     * @param func
     * @param values
     */
    expr(func: (...args: unknown) => unknown, values: unknown[]): unknown {
        if (values.some(item => item instanceof IValue)) {
            return new Expression(func, values);
        } else {
            return func.apply(null, values);
        }
    },
    rp: readProperty,
    wp: writeValue,
    pe: propertyExtractor,
    rv: dereference,
    sv: assign,
};
