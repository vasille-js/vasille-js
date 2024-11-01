import { ArrayModel, Expression, Fragment, IValue, Pointer, Reference, userError } from "vasille";
import { readValue } from "./inline";
import { ensureIValue } from "./library";

export type Path = (string | number)[];

export function readProperty(o: unknown, path: Path): unknown {
    let target: unknown = readValue(o);

    for (let i = 0; i < path.length; i++) {
        const field = path[i];
        if (typeof target === "object" && target !== null && field in target) {
            target = target[field];
        }
        if (target instanceof IValue) {
            const nextIs$ = path[i + 1] === "$";

            if (i !== path.length - 1 && !(i === path.length - 2 && nextIs$)) {
                target = target.$;
            }
            if (nextIs$) {
                i++;
            }
        }
    }

    return target;
}

export function writeValue(o: unknown, path: Path, v: unknown) {
    const field = path.pop();
    const target = field === "$" ? readProperty(o, path) : readValue(readProperty(o, path));
    const current =
        typeof target === "object" && target !== null && field && field in target ? target[field] : undefined;

    if (field === "$" && target instanceof IValue) {
        target.$ = readValue(v);
    } else if (current instanceof Pointer && v instanceof IValue) {
        current.$$ = v as IValue<unknown>;
    } else if (current instanceof IValue) {
        current.$ = readValue(v);
    } else if (target instanceof ArrayModel) {
        target.replace(field as number, v);
    } else if (typeof target === "object" && target !== null) {
        target[field as string] = readValue(v);
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
            target = target.$;
        }
    }

    if (iValue && index >= 0) {
        const fixedPath = path.slice(index + 1);

        if (fixedPath.length === 0) {
            return iValue;
        }

        return new Expression((obj: unknown) => {
            return readProperty(obj, fixedPath);
        }, iValue);
    }

    return target;
}

class ProxyReference extends Reference<unknown> {
    public forceUpdate() {
        this.updateDeps(this.state);
    }
}

function proxyObject(obj: object, proxyRef: ProxyReference) {
    return new Proxy(obj, {
        get(target: object, p: string | symbol, receiver: any): any {
            return proxy(Reflect.get(target, p, receiver), proxyRef);
        },
        set(target: object, p: string | symbol, newValue: any, receiver: any): boolean {
            const response = Reflect.set(target, p, newValue, receiver);

            if (response) {
                proxyRef.forceUpdate();
            }

            return response;
        },
        defineProperty(target: object, property: string | symbol, attributes: PropertyDescriptor): boolean {
            const response = Reflect.defineProperty(target, property, attributes);

            if (response) {
                proxyRef.forceUpdate();
            }

            return response;
        },
        deleteProperty(target: object, p: string | symbol): boolean {
            const response = Reflect.deleteProperty(target, p);

            if (response) {
                proxyRef.forceUpdate();
            }

            return response;
        },
    });
}

export function proxy(o: unknown, ref?: ProxyReference) {
    if (typeof o === "object" && o && o.constructor === Object) {
        if (ref) {
            return proxyObject(o, ref);
        } else {
            const proxyRef = new ProxyReference(undefined);

            proxyRef.$ = proxyObject(o, proxyRef);

            return proxyRef;
        }
    }

    return o;
}

export function reactiveObject<T extends object>(
    node: unknown,
    o: T,
): { [K in keyof T]: T[K] extends IValue<unknown> ? T[K] : IValue<T[K]> } {
    if (node instanceof Fragment) {
        for (const key of Object.keys(o)) {
            if (!(o[key] instanceof IValue)) {
                o[key] = ensureIValue(node, proxy(o[key]));
            }
        }
    } else {
        for (const key of Object.keys(o)) {
            if (!(o[key] instanceof IValue)) {
                o[key] = ensureIValue(null, proxy(o[key]));
            }
        }
    }

    return o as { [K in keyof T]: T[K] extends IValue<unknown> ? T[K] : IValue<T[K]> };
}
