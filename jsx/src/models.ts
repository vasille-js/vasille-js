import { ArrayModel, Destroyable, IValue, MapModel, Reactive, Reference, SetModel } from "vasille";

class Context extends Destroyable {
    #ctx = new Reactive({});

    public checkEnable(value: unknown) {
        if (value && typeof value === "object" && value.constructor === Object) {
            this.#enableObject(value);
        }
    }

    public checkDisable(value: unknown) {
        if (value && typeof value === "object" && value.constructor === Object) {
            this.#disableObject(value);
        }
    }

    #enableObject(o: object) {
        for (const key of Object.keys(o)) {
            if (!(o[key] instanceof IValue)) {
                o[key] = this.#ctx.register(new Reference(o[key]));
            }
        }
    }

    #disableObject(o: object) {
        for (const key of Object.keys(o)) {
            if (o[key] instanceof IValue) {
                this.#ctx.release(o[key]);
            }
        }
    }

    public destroy(): void {
        this.#ctx.destroy();
    }
}

export class ContextArray<T> extends ArrayModel<T> {
    private ctx: Context;

    public constructor(data?: Array<T>|number) {
        const ctx = new Context();

        if (data instanceof Array) {
            for (const item of data) {
                ctx.checkEnable(item);
            }
        }

        super(data);
        this.ctx = ctx;
    }

    public fill(value: T, start?: number, end?: number): this {
        this.ctx.checkEnable(value);

        return super.fill(value, start, end);
    }

    public pop(): T | undefined {
        const value = super.pop();

        this.ctx.checkDisable(value);
        return value;
    }

    public push(...items: Array<T>): number {
        for (const item of items) {
            this.ctx.checkEnable(item);
        }
        return super.push(...items);
    }

    public shift(): T | undefined {
        const value = super.shift();

        this.ctx.checkDisable(value);
        return value;
    }

    public splice(start: number, deleteCount?: number | undefined, ...items: T[]): ArrayModel<T> {
        for (const item of items) {
            this.ctx.checkEnable(item);
        }

        const removed = super.splice(start, deleteCount, ...items);

        for (const item of removed) {
            this.ctx.checkDisable(removed);
        }

        return removed;
    }

    public unshift(...items: T[]): number {
        for (const item of items) {
            this.ctx.checkEnable(item);
        }

        return super.unshift(...items);
    }

    public replace(at: number, with_: T): this {
        this.ctx.checkDisable(this[at]);
        this.ctx.checkEnable(with_);

        return super.replace(at, with_);
    }

    public destroy(): void {
        super.destroy();
        this.ctx.destroy();
    }
}

export class ContextMap<K, T> extends MapModel<K, T> {
    private ctx: Context;

    public constructor(map: [K, T][] = []) {
        const ctx = new Context();

        for (const item of map) {
            ctx.checkDisable(item[1]);
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
        this.ctx.checkEnable(value);

        return super.set(key, value);
    }

    public destroy(): void {
        super.destroy();
        this.ctx.destroy();
    }
}

export class ContextSet<T> extends SetModel<T> {
    private ctx: Context;

    public constructor(set: T[] = []) {
        const ctx = new Context();

        for (const item of set) {
            ctx.checkEnable(item);
        }

        super(set);
        this.ctx = ctx;
    }

    public add(value: T): this {
        this.ctx.checkEnable(value);

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
