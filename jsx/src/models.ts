import { ArrayModel, Destroyable, IValue, MapModel, Reactive, SetModel } from "vasille";
import { ProxyReference, proxyObject } from "./objects";

const symbol = Symbol("proxy");

class Context extends Destroyable {
    #ctx = new Reactive({});

    public checkEnable<T>(value: T): T {
        if (value && typeof value === "object" && value.constructor === Object) {
            return this.#enableObject(value);
        }

        return value;
    }

    public checkDisable(value: unknown) {
        if (value && typeof value === "object" && value.constructor === Object) {
            this.#disableObject(value);
        }
    }

    #enableObject<T extends object>(o: T): T {
        if (symbol in o) {
            this.#ctx.register(o[symbol] as Destroyable);

            return o;
        }
        const ref = new ProxyReference(undefined);

        o[symbol] = ref;
        this.#ctx.register(ref);

        return proxyObject(o, ref) as T;
    }

    #disableObject(o: object) {
        this.#ctx.release(o[symbol]);
    }

    public destroy(): void {
        this.#ctx.destroy();
    }
}

export class ContextArray<T> extends ArrayModel<T> {
    private ctx: Context;

    public constructor(data?: Array<T> | number) {
        const ctx = new Context();

        if (data instanceof Array) {
            for (let i = 0; i < data.length; i++) {
                data[i] = ctx.checkEnable(data[i]);
            }
        }

        super(data);
        this.ctx = ctx;
    }

    public fill(value: T, start?: number, end?: number): this {
        value = this.ctx.checkEnable(value);

        return super.fill(value, start, end);
    }

    public pop(): T | undefined {
        const value = super.pop();

        this.ctx.checkDisable(value);
        return value;
    }

    public push(...items: Array<T>): number {
        for (let i = 0; i < items.length; i++) {
            items[i] = this.ctx.checkEnable(items[i]);
        }
        return super.push(...items);
    }

    public shift(): T | undefined {
        const value = super.shift();

        this.ctx.checkDisable(value);
        return value;
    }

    public splice(start: number, deleteCount?: number | undefined, ...items: T[]): ArrayModel<T> {
        for (let i = 0; i < items.length; i++) {
            items[i] = this.ctx.checkEnable(items[i]);
        }

        const removed = super.splice(start, deleteCount, ...items);

        for (const item of removed) {
            this.ctx.checkDisable(removed);
        }

        return removed;
    }

    public unshift(...items: T[]): number {
        for (let i = 0; i < items.length; i++) {
            items[i] = this.ctx.checkEnable(items[i]);
        }

        return super.unshift(...items);
    }

    public replace(at: number, with_: T): this {
        this.ctx.checkDisable(this[at]);
        with_ = this.ctx.checkEnable(with_);

        return super.replace(at, with_);
    }

    public destroy(): void {
        super.destroy();
        this.ctx.destroy();
    }
}

export class ContextMap<K, T> extends MapModel<K, T> {
    private ctx: Context;

    public constructor(map?: [K, T][]) {
        const ctx = new Context();

        if (map) {
            for (const item of map) {
                item[1] = ctx.checkEnable(item[1]);
            }
        }
        super(map);
        this.ctx = ctx;
    }

    public clear(): void {
        for (const value of this.values()) {
            this.ctx.checkDisable(value);
        }

        super.clear();
    }

    public delete(key: K): boolean {
        this.ctx.checkDisable(this.get(key));

        return super.delete(key);
    }

    public set(key: K, value: T): this {
        this.ctx.checkDisable(this.get(key));
        value = this.ctx.checkEnable(value);

        return super.set(key, value);
    }

    public destroy(): void {
        super.destroy();
        this.ctx.destroy();
    }
}

export class ContextSet<T> extends SetModel<T> {
    private ctx: Context;

    public constructor(set?: T[]) {
        const ctx = new Context();

        if (set) {
            for (let i = 0; i < set.length; i++) {
                set[i] = ctx.checkEnable(set[i]);
            }
        }

        super(set);
        this.ctx = ctx;
    }

    public add(value: T): this {
        value = this.ctx.checkEnable(value);

        return super.add(value);
    }

    public clear(): void {
        for (const item of this) {
            this.ctx.checkDisable(item);
        }
        super.clear();
    }

    public delete(value: T): boolean {
        this.ctx.checkDisable(value);
        return super.delete(value);
    }

    public destroy(): void {
        super.destroy();
        this.ctx.destroy();
    }
}
