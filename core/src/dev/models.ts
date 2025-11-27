import { Reactive } from "../core/core.js";
import { ArrayModel } from "../models/array-model.js";
import { MapModel } from "../models/map-model.js";
import { SetModel } from "../models/set-model.js";
import { Inspector, provideId, StaticPosition, toDevIdOrValue, toDevValue } from "./inspectable.js";

export class DevArrayModel<T> extends ArrayModel<T> {
    public readonly id: number;
    public readonly inspector: Inspector | undefined;

    public constructor(
        inspector: Inspector | undefined,
        usage: StaticPosition,
        data?: Array<T> | number,
        ctx?: Reactive,
    ) {
        super(data, ctx);

        this.id = provideId();
        this.inspector = inspector;

        inspector?.createModel({
            id: this.id,
            type: "array",
            values: this.map((item, index) => [index, toDevValue(item)]),
            usage: usage,
        });
    }

    public destroy(): void {
        this.inspector?.destroy(this.id);
        super.destroy();
    }

    public fill(value: T, start?: number, end?: number): this {
        this.shareChange("fill", [value, start, end], undefined);
        return super.fill(value, start, end);
    }

    public pop(): T | undefined {
        const result = super.pop();
        this.shareChange("pop", [], result);
        return result;
    }

    public push(...items: T[]): number {
        const result = super.push(...items);
        this.shareChange("push", items, result);
        return result;
    }

    public shift(): T | undefined {
        const result = super.shift();
        this.shareChange("shift", [], result);
        return result;
    }

    public splice(start: number, deleteCount?: number, ...items: T[]): ArrayModel<T> {
        this.shareChange("splice", [start, deleteCount, ...items], undefined);
        return super.splice(start, deleteCount, ...items);
    }

    public unshift(...items: T[]): number {
        const result = super.unshift(...items);
        this.shareChange("unshift", items, result);
        return result;
    }

    protected shareChange(method: string, args: unknown[], result: unknown) {
        this.inspector?.updateModel({
            id: this.id,
            method: method,
            args: args.map(toDevIdOrValue),
            return: toDevIdOrValue(result),
        });
    }
}

export class DevSetModel<T> extends SetModel<T> {
    public readonly id: number;
    public readonly inspector: Inspector | undefined;

    public constructor(inspector: Inspector | undefined, usage: StaticPosition, set?: T[], ctx?: Reactive) {
        super(set, ctx);
        this.id = provideId();
        this.inspector = inspector;

        inspector?.createModel({
            id: this.id,
            type: "set",
            values: [...this].map(item => [0, toDevIdOrValue(item)]),
            usage: usage,
        });
    }

    public destroy(): void {
        this.inspector?.destroy(this.id);
        super.destroy();
    }

    public add(value: T): this {
        this.shareChange("add", [value], undefined);
        return super.add(value);
    }

    public clear(): void {
        this.shareChange("clear", [], undefined);
        return super.clear();
    }

    public delete(value: T): boolean {
        const result = super.delete(value);
        this.shareChange("delete", [value], result);
        return result;
    }

    protected shareChange(method: string, args: unknown[], result: unknown) {
        this.inspector?.updateModel({
            id: this.id,
            method: method,
            args: args.map(toDevIdOrValue),
            return: toDevIdOrValue(result),
        });
    }
}

export class DevMapModel<K, T> extends MapModel<K, T> {
    public readonly id: number;
    public readonly inspector: Inspector | undefined;

    public constructor(inspector: Inspector | undefined, usage: StaticPosition, map?: [K, T][], ctx?: Reactive) {
        super(map, ctx);
        this.id = provideId();
        this.inspector = inspector;

        inspector?.createModel({
            id: this.id,
            type: "map",
            values: [...this.entries()].map(([key, value]) => [toDevIdOrValue(key), toDevIdOrValue(value)]),
            usage: usage,
        });
    }

    public destroy(): void {
        this.inspector?.destroy(this.id);
    }

    public clear(): void {
        this.shareChange("clear", [], undefined);
        super.clear();
    }

    public delete(key: K): boolean {
        const result = super.delete(key);
        this.shareChange("delete", [key], result);
        return result;
    }

    public set(key: K, value: T): this {
        this.shareChange("set", [key, value], undefined);
        return super.set(key, value);
    }

    protected shareChange(method: string, args: unknown[], result: unknown) {
        this.inspector?.updateModel({
            id: this.id,
            method: method,
            args: args.map(toDevIdOrValue),
            return: toDevIdOrValue(result),
        });
    }
}
