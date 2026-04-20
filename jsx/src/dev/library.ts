import { StaticPosition } from "vasille/dev";
import { awaited } from "../library.js";
import { devRef } from "./internal.js";
import { IValue, Reactive } from "vasille";

export function devAwaited<T>(
    target: () => Promise<T>,
    callback: (error: IValue<unknown>, data: IValue<unknown>) => void,
    declaration: [StaticPosition, StaticPosition],
    ctx: Reactive,
): [IValue<unknown>, IValue<unknown>, () => void, (reason?: unknown) => void] {
    let i = 0;
    const result = awaited(target, ctx, v => devRef(v, ctx, declaration[i++]));

    callback(result[0], result[1]);

    return result;
}
