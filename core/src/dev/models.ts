import { Reactive } from "../core/core.js";
import { ArrayModel } from "../models/array-model.js";
import { MapModel } from "../models/map-model.js";
import { SetModel } from "../models/set-model.js";
import { DevValue, Inspector, provideId, StaticPosition, toDevIdOrValue, toDevValue } from "./inspectable.js";

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

        if (inspector) {
            const values: [DevValue, DevValue][] = [];

            for (let i = 0; i < this.length; i++) {
                values.push([toDevValue(i), toDevValue(this[i])]);
            }

            inspector.createModel({
                id: this.id,
                type: "array",
                values: values,
                usage: usage,
                time: Date.now(),
            });
        }
    }

    public override destroy(): void {
        this.inspector?.destroy({ id: this.id, time: Date.now() });
        super.destroy();
    }

    public override fill(value: T, start?: number, end?: number): this {
        this.shareChange("fill", [value, start, end], undefined);
        return super.fill(value, start, end);
    }

    public override pop(): T | undefined {
        const result = super.pop();
        this.shareChange("pop", [], result);
        return result;
    }

    public override push(...items: T[]): number {
        const result = super.push(...items);
        this.shareChange("push", items, result);
        return result;
    }

    public override shift(): T | undefined {
        const result = super.shift();
        this.shareChange("shift", [], result);
        return result;
    }

    public override splice(start: number, deleteCount?: number, ...items: T[]): T[] {
        this.shareChange("splice", [start, deleteCount, ...items], undefined);
        return super.splice(start, deleteCount, ...items);
    }

    public override unshift(...items: T[]): number {
        const result = super.unshift(...items);
        this.shareChange("unshift", items, result);
        return result;
    }

    protected shareChange(method: string, args: unknown[], result: unknown) {
        this.inspector?.updateModel({
            id: this.id,
            method: method,
            args: args.map(toDevValue),
            return: toDevValue(result),
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
            values: [...this].map(item => [toDevValue(0), toDevValue(item)]),
            usage: usage,
            time: Date.now(),
        });
    }

    public override destroy(): void {
        this.inspector?.destroy({ id: this.id, time: Date.now() });
        super.destroy();
    }

    public override add(value: T): this {
        this.shareChange("add", [value], undefined);
        return super.add(value);
    }

    public override clear(): void {
        this.shareChange("clear", [], undefined);
        return super.clear();
    }

    public override delete(value: T): boolean {
        const result = super.delete(value);
        this.shareChange("delete", [value], result);
        return result;
    }

    protected shareChange(method: string, args: unknown[], result: unknown) {
        this.inspector?.updateModel({
            id: this.id,
            method: method,
            args: args.map(toDevValue),
            return: toDevValue(result),
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
            values: [...this.entries()].map(([key, value]) => [toDevValue(key), toDevValue(value)]),
            usage: usage,
            time: Date.now(),
        });
    }

    public override destroy(): void {
        this.inspector?.destroy({ id: this.id, time: Date.now() });
    }

    public override clear(): void {
        this.shareChange("clear", [], undefined);
        super.clear();
    }

    public override delete(key: K): boolean {
        const result = super.delete(key);
        this.shareChange("delete", [key], result);
        return result;
    }

    public override set(key: K, value: T): this {
        this.shareChange("set", [key, value], undefined);
        return super.set(key, value);
    }

    protected shareChange(method: string, args: unknown[], result: unknown) {
        this.inspector?.updateModel({
            id: this.id,
            method: method,
            args: args.map(toDevValue),
            return: toDevValue(result),
        });
    }
}
