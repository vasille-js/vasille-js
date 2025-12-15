import {
    IValue,
    Reactive,
    KindOfIValue,
    Expression,
    Reference,
    Forward,
    Backward,
    SetModel,
    MapModel,
    ArrayModel,
} from "vasille";

export function expr<T, Args extends unknown[]>(
    ctx: Reactive | undefined,
    func: (...args: Args) => T,
    values: KindOfIValue<Args>,
): Expression<T, Args> {
    return new Expression(func, values, ctx);
}

export function forward<T>(ctx: Reactive | undefined, v: IValue<T>): IValue<T> {
    return new Forward(v, ctx);
}

export function backward<T>(v: IValue<T>): IValue<T> {
    return new Backward(v);
}

/**
 * It transforms a non-reactive value to a reactive one.
 * 1. `let a = 0` to `const a = ref(0)`
 */
export function ref<T>(v: T): IValue<T> {
    return new Reference(v);
}

/**
 * create a `Set` model
 * 1. translate `new Set(#)` to `set(ctx, #)`
 */
export function setModel(ctx: Reactive | undefined, data?: unknown[]) {
    return new SetModel(data, ctx);
}

/**
 * create a `Map` model
 * 1. `new Map(#)` to `mapModel(ctx, #)`
 */
export function mapModel(ctx: Reactive | undefined, data?: [unknown, unknown][]) {
    return new MapModel(data, ctx);
}

/**
 * create an `Array` model
 * 1. `[...]` to `arrayModel(ctx, [...])`
 */
export function arrayModel(ctx: Reactive | undefined, data?: unknown[] | number) {
    return new ArrayModel(data, ctx);
}

/**
 * Use when a value must be IValue but can be undefined
 * 1. `let a = obj.$key` to `const a = ensure(obj.$key)`
 */
export function ensure(data: unknown) {
    return data instanceof IValue ? data : new Reference(data);
}

/**
 * Used for destruction with computed values
 * 1. `{[a]: a1} = {x: 2}` to `{[a]: a1 = match("a1")} = {x: 2}`
 * 1. `{[a]: a1 = 3} = {x: 2}` to `{[a]: a1 = match("a1", 3)} = {x: 2}`
 */
export function match(name: string | number | symbol, data?: unknown) {
    const iValueRequired = typeof name === "string" && name.startsWith("$");
    const isIValue = data instanceof IValue;

    if (iValueRequired && !isIValue) {
        return new Reference(data);
    }
    if (!iValueRequired && isIValue) {
        return data.V;
    }

    return data;
}

/**
 * Set a value of a field (alternative to proxies)
 * 1. `obj.$key = 23` to `set(obj, "$key", 23)`
 * 2. `arr[0] = 23` to `set(arr, 0, 23)`
 */
export function set(o: object, key: string | symbol | number, value: unknown) {
    if (o[key] instanceof IValue) {
        o[key].V = value;
    } else if (o instanceof ArrayModel && typeof key === "number") {
        o.replace(key, value);
    } else if (typeof key === "string" && key.charAt(0) === "$") {
        o[key] = new Reference(value);
    } else {
        o[key] = value;
    }
    return value;
}

export function extract<T>(value: IValue<T> | T): T {
    return value instanceof IValue ? value.V : value;
}
