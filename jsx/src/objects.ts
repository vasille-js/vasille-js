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
            return proxyObject(Reflect.get(target, p, receiver), proxyRef);
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
                return (o[p] = node.ref(undefined));
            }
        },
        set(_, p, newValue) {
            const value = newValue instanceof IValue ? newValue.$ : newValue;

            if (p in o) {
                o[p].$ = value;
            } else {
                o[p] = node.ref(value);
            }

            return true;
        },
    }) as { [K in keyof T]: T[K] extends IValue<unknown> ? T[K] : IValue<T[K]> };
}
