import { IValue, proxyArrayModel, Reactive, KindOfIValue, Expression, Pointer, Reference, Fragment } from "vasille";
import { reactiveObject, reactiveObjectProxy } from "./objects";
import { ContextArray, ContextMap, ContextSet } from "./models";

export const internal = {
    /** create an expression (without context), use it for OwningPointer */
    ex<T, Args extends unknown[]>(func: (...args: Args) => T, ...values: KindOfIValue<Args>) {
        return new Expression(func, ...values);
    },
    /** create a forward-only pointer (without context), use it for OwningPointer */
    fo<T>(v: IValue<T>): IValue<T> {
        return new Pointer(v);
    },
    /** create a reference (without context), use it for default composing props values */
    r<T>(v: T): IValue<T> {
        return new Reference(v);
    },
    /** create a reactive object proxy, use it for sending reactive objects to child components */
    rop<T extends { [k: string | symbol]: IValue<unknown> }>(
        o: T,
    ): { [K in keyof T]: T[K] extends IValue<infer R> ? R : never } {
        return reactiveObjectProxy(o);
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
