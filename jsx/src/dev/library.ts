import { Inspector, StaticPosition } from "vasille/dev";
import { awaited } from "../library.js";
import { devRef } from "./internal.js";
import { IValue } from "vasille";

export function devAwaited<T>(
    target: () => Promise<T>,
    callback: (error: IValue<unknown>, data: IValue<unknown>) => void,
    declaration: [StaticPosition, StaticPosition],
    inspector?: Inspector,
): [IValue<unknown>, IValue<unknown>, () => void] {
    let i = 0;
    const result = awaited(target, v => devRef(v, declaration[i++], inspector));

    callback(result[0], result[1]);

    return result;
}
