import {
    IValue,
    proxyArrayModel,
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
 * 1. translate `new Set(#)` to `set(this, #)`
 * 2. `import { setModel }` to `import { set as setModel }`
 */
export function set(ctx: Reactive | undefined, data?: unknown[]) {
    return new SetModel(data, ctx);
}

/**
 * create a `Map` model
 * 1. `new Map(#)` to `map(this, #)`
 * 2. `import { mapModel }` to `import { map as mapModel }`
 */
export function map(ctx: Reactive | undefined, data?: [unknown, unknown][]) {
    return new MapModel(data, ctx);
}

/**
 * create an `Array` model
 * 1. `[...]` to `array(this, [...])`
 * 2. `import { arrayModel }` to `import { array as arrayModel }`
 */
export function array(ctx: Reactive | undefined, data?: unknown[] | number) {
    return proxyArrayModel(new ArrayModel(data, ctx));
}

/**
 * Use when a value must be IValue but can be undefined
 * 1. `let a = obj.$key` to `const a = ensure(obj.$key)`
 */
export function ensure(data: unknown) {
    return data instanceof IValue ? data : new Reference(data);
}

export function write(o: object, key: string | symbol, value: unknown) {
    if (o[key] instanceof IValue) {
        o[key].V = value;
    } else {
        o[key] = new Reference(value);
    }
}

export function writeES5(o: object, key: string | symbol, value: unknown) {
    if (o[key] instanceof IValue) {
        o[key].V = value;
    } else if (o instanceof ArrayModel) {
        const index = !o.passive && typeof key === "string" && parseInt(key);
        if (typeof index === "number" && Number.isFinite(index)) {
            o.replace(index, value);
        } else {
            o[key] = value;
        }
    } else {
        o[key] = new Reference(value);
    }
}
