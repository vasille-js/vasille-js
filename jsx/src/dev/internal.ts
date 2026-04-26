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
    depsCode: string[],
    declaration: StaticPosition,
    name?: string,
): DevExpression<T, Args> {
    return new DevExpression<T, Args>(func, values, ctx, name, depsCode, declaration, false);
}

export function devRef<T>(v: T, ctx: Reactive | undefined, declaration: StaticPosition, name?: string): DevIValue<T> {
    return new DevReference(v, ctx, declaration, name);
}

export function devSetModel(usage: StaticPosition, ctx: Reactive | undefined, data?: unknown[], name?: string) {
    return new DevSetModel(usage, data, ctx, name);
}

export function devMapModel(
    usage: StaticPosition,
    ctx: Reactive | undefined,
    data?: [unknown, unknown][],
    name?: string,
) {
    return new DevMapModel(usage, data, ctx, name);
}

export function devArrayModel(
    usage: StaticPosition,
    ctx: Reactive | undefined,
    data?: unknown[] | number,
    name?: string,
) {
    return new DevArrayModel(usage, data, ctx, name);
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
