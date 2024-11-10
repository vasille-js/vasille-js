import { IValue, Reactive, Reference } from "vasille";
import { ensureIValue } from "./library";

export class ProxyReference extends Reference<unknown> {
    public forceUpdate() {
        this.updateDeps(this.state);
    }
}

export function proxyObject(obj: object, proxyRef: ProxyReference) {
    return new Proxy(obj, {
        get(target: object, p: string | symbol, receiver: any): any {
            const value = Reflect.get(target, p, receiver);

            return value instanceof Object ? proxyObject(value, proxyRef) : value;
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

export function proxy(o: unknown) {
    if (typeof o === "object" && o && o.constructor === Object) {
        const proxyRef = new ProxyReference(undefined);

        proxyRef.$ = proxyObject(o, proxyRef);

        return proxyRef;
    }

    return o;
}

export function reactiveObject<T extends object>(
    node: Reactive,
    o: T,
): { [K in keyof T]: T[K] extends IValue<unknown> ? T[K] : IValue<T[K]> } {
    for (const key of Object.keys(o)) {
        if (!(o[key] instanceof IValue)) {
            o[key] = ensureIValue(node, proxy(o[key]));
        }
    }

    return new Proxy(o, {
        get(_, p) {
            if (p in o) {
                return o[p];
            } else {
                return (o[p] = node.register(new Reference(undefined)));
            }
        },
        deleteProperty(_, p: string | symbol): boolean {
            if (p in o && o[p] instanceof IValue) {
                node.release(p[0]);
            }

            return Reflect.deleteProperty(o, p);
        },
    }) as { [K in keyof T]: T[K] extends IValue<unknown> ? T[K] : IValue<T[K]> };
}

export function reactiveObjectProxy<T extends { [k: string | symbol]: IValue<unknown> }>(
    o: T,
): { [K in keyof T]: T[K] extends IValue<infer R> ? R : never } {
    return new Proxy(o, {
        get(_, p: string | symbol): any {
            return o[p].$;
        },
        set(_, p: string | symbol, newValue: any): boolean {
            o[p].$ = newValue;

            return true;
        },
    }) as { [K in keyof T]: T[K] extends IValue<infer R> ? R : never };
}
