import { Expression, IValue, Pointer, userError } from "vasille";
import { dereference } from "./inline";

export type Path = (string | number)[];

export function readProperty(o: unknown, path: Path): unknown {
    let target: unknown = o;

    for (let i = 0; i < path.length; i++) {
        const field = path[i];
        if (typeof target === "object" && target !== null && field in target) {
            target = target[field];
        }
        if (target instanceof IValue) {
            if (i !== path.length - 1) {
                target = target.$;
            }
            if (i + 1 < path.length && path[i + 1] === "$") {
                i++;
            }
        }
    }

    return target;
}

export function writeValue(o: unknown, path: Path, v: unknown) {
    const field = path.pop();
    const target = readProperty(o, path);
    const current = typeof target === "object" && target !== null && field in target ? target[field] : undefined;

    if (field === "$" && target instanceof IValue) {
        target.$ = dereference(v);
    } else if (current instanceof Pointer && v instanceof IValue) {
        current.$$ = v as IValue<unknown>;
    } else if (current instanceof IValue) {
        current.$ = dereference(v);
    } else if (typeof target === "object" && target !== null && field in target) {
        target[field] = dereference(v);
    } else {
        Object.defineProperty(target, field, { value: dereference(v), configurable: false });
    }
}

export function propertyExtractor(source: unknown, path: Path): unknown {
    let iValue: IValue<unknown> | undefined;
    let index = -1;
    let target = source;

    for (let i = 0; i < path.length; i++) {
        const field = path[i];
        if (typeof target === "object" && target !== null && field in target) {
            target = target[field];
        }
        if (target instanceof IValue && path[i + 1] !== "$") {
            if (iValue) {
                throw userError("Time complexity is too big", "time-complexity");
            }
            iValue = target as IValue<unknown>;
            index = i;
        }
    }

    if (iValue && index >= 0) {
        const fixedPath = path.slice(index);

        if (fixedPath.length === 0) {
            return iValue;
        }

        return new Expression(
            (obj: unknown) => {
                return readProperty(obj, fixedPath);
            },
            true,
            iValue,
        );
    }

    return target;
}
