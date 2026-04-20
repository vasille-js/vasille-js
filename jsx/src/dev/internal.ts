import { Reactive } from "vasille";
import {
    DevArrayModel,
    DevExpression,
    DevIValue,
    DevMapModel,
    DevReference,
    DevSetModel,
    ExecutionPosition,
    KindOfDevIValue,
    StaticPosition,
} from "vasille/dev";
import { match, set } from "../internal.js";

export function devExpr<T, Args extends unknown[]>(
    ctx: Reactive | undefined,
    func: (...args: Args) => T,
    values: KindOfDevIValue<Args>,
    name: string | undefined,
    depsCode: string[],
    declaration: StaticPosition,
): DevExpression<T, Args> {
    return new DevExpression<T, Args>(func, values, ctx, name, depsCode, declaration, false);
}

export function devRef<T>(v: T, ctx: Reactive | undefined, declaration: StaticPosition): DevIValue<T> {
    return new DevReference(v, ctx, declaration);
}

export function devSetModel(usage: StaticPosition, ctx: Reactive | undefined, data?: unknown[]) {
    return new DevSetModel(usage, data, ctx);
}

export function devMapModel(usage: StaticPosition, ctx: Reactive | undefined, data?: [unknown, unknown][]) {
    return new DevMapModel(usage, data, ctx);
}

export function devArrayModel(usage: StaticPosition, ctx: Reactive | undefined, data?: unknown[] | number) {
    return new DevArrayModel(usage, data, ctx);
}

export function devEnsure<T extends object>(
    obj: T | null | undefined,
    key: keyof T,
    ctx: Reactive | undefined,
    declaration: StaticPosition,
) {
    if (!obj) {
        return undefined;
    }

    return key in obj ? obj[key] : (obj[key] = devRef(undefined, ctx, declaration) as unknown as T[keyof T]);
}

export function devMatch(name: string | number | symbol, data: unknown, declaration: StaticPosition, ctx?: Reactive) {
    return match(name, data, v => devRef(v, ctx, declaration));
}

export function devSet(
    o: object,
    key: string | symbol | number,
    value: unknown,
    ctx: Reactive | undefined,
    declaration: StaticPosition,
    executionPosition: ExecutionPosition,
) {
    if (o[key] instanceof DevIValue) {
        o[key].update(value, executionPosition);
        return value;
    }

    return set(o, key, value, v => devRef(v, ctx, declaration));
}
