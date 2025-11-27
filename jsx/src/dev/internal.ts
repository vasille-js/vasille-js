import { IValue, Reactive } from "vasille";
import {
    DevArrayModel,
    DevExpression,
    DevIValue,
    DevMapModel,
    DevReference,
    DevSetModel,
    ExecutionPosition,
    Inspector,
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
    inspector: Inspector,
): DevExpression<T, Args> {
    return new DevExpression<T, Args>(func, values, ctx, depsCode, declaration, inspector, false);
}

export function devRef<T>(v: T, declaration: StaticPosition, inspector?: Inspector): DevIValue<T> {
    return new DevReference(v, declaration, inspector);
}

export function devSetModel(
    inspector: Inspector | undefined,
    usage: StaticPosition,
    ctx: Reactive | undefined,
    data?: unknown[],
) {
    return new DevSetModel(inspector, usage, data, ctx);
}

export function devMapModel(
    inspector: Inspector | undefined,
    usage: StaticPosition,
    ctx: Reactive | undefined,
    data?: [unknown, unknown][],
) {
    return new DevMapModel(inspector, usage, data, ctx);
}

export function devArrayModel(
    inspector: Inspector | undefined,
    usage: StaticPosition,
    ctx: Reactive | undefined,
    data?: unknown[] | number,
) {
    return new DevArrayModel(inspector, usage, data, ctx);
}

export function devEnsure(data: unknown, declaration: StaticPosition, inspector: Inspector | undefined) {
    return data instanceof IValue ? data : devRef(data, declaration, inspector);
}

export function devMatch(
    name: string | number | symbol,
    data: unknown,
    declaration: StaticPosition,
    inspector: Inspector | undefined,
) {
    return match(name, data, v => devRef(v, declaration, inspector));
}

export function devSet(
    o: object,
    key: string | symbol | number,
    value: unknown,
    declaration: StaticPosition,
    inspector: Inspector | undefined,
    executionPosition: ExecutionPosition,
) {
    if (o[key] instanceof DevIValue) {
        o[key].update(value, executionPosition);
        return value;
    }

    return set(o, key, value, v => devRef(v, declaration, inspector));
}
