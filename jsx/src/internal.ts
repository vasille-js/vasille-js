import { IValue, proxyArrayModel, Reactive, KindOfIValue, Expression, Pointer } from "vasille";
import { reactiveObject } from "./objects";
import { ContextArray, ContextMap, ContextSet } from "./models";

export const internal = {
    /** create an expresion (without context), use for OwningPointer */
    ex<T, Args extends unknown[]>(func: (...args: Args) => T, ...values: KindOfIValue<Args>) {
        return new Expression(func, ...values);
    },
    /** create a forward-only pointer (without context), use for OwningPointer */
    fo<T>(v: IValue<T>): IValue<T> {
        return new Pointer(v);
    },
    /**
     * translate `{...}` to `$.ro(this, {...})`
     */
    ro: reactiveObject,
    /**
     * translate `new Set(#)` to `$.sm(this, #)`
     */
    sm(node: Reactive, data?: unknown[]) {
        return node.register(new ContextSet(data));
    },
    /**
     * translate `new Map(#)` to `$.mm(this, #)`
     */
    mm(node: Reactive, data?: [unknown, unknown][]) {
        return node.register(new ContextMap(data));
    },
    /**
     * translate `[...]` to `$.am(this, [...])`
     */
    am(node: Reactive, data?: unknown[]) {
        return node.register(proxyArrayModel(new ContextArray(data)));
    },
};
