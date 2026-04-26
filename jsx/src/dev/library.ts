import { StaticPosition } from "vasille/dev";
import { awaited } from "../library.js";
import { devRef } from "./internal.js";
import { IValue, Reactive } from "vasille";

type DebugData = [StaticPosition, string | undefined];

export function devAwaited<T>(
    target: () => Promise<T>,
    declaration: [DebugData, DebugData],
    ctx: Reactive,
): [IValue<unknown>, IValue<unknown>, () => void, (reason?: unknown) => void] {
    let i = 0;
    return awaited(target, ctx, v => devRef(v, ctx, ...declaration[i++]));
}
