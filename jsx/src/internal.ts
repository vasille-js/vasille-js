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
        const set = new ContextSet(data);
        node.register(set);
        return set;
    },
    /**
     * translate `new Map(#)` to `$.mm(this, #)`
     */
    mm(node: Reactive, data?: [unknown, unknown][]) {
        const map = new ContextMap(data);
        node.register(map);
        return map;
    },
    /**
     * translate `[...]` to `$.am(this, [...])`
     */
    am(node: Reactive, data?: unknown[]) {
        const arr = proxyArrayModel(new ContextArray(data));
        node.register(arr);
        return arr;
    },
};
