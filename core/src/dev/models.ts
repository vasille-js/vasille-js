import { Reactive } from "../core/core.js";
import { Destroyable } from "../core/destroyable.js";
import { ArrayModel } from "../models/array-model.js";
import { MapModel } from "../models/map-model.js";
import { SetModel } from "../models/set-model.js";
import { DevReactive } from "./core.js";
import {
    DevValue,
    inspector,
    Inspector,
    provideId,
    StaticPosition,
    toDevIdOrValue,
    toDevValue,
} from "./inspectable.js";

export class DevArrayModel<T> extends ArrayModel<T> implements Destroyable {
    public readonly id: number;

    public constructor(usage: StaticPosition, data?: Array<T> | number, ctx?: Reactive, name?: string) {
        super(data, ctx);

        this.id = provideId();

        ctx?.bind(this);
        inspector.createModel({
            id: this.id,
            type: "array",
            usage: usage,
            time: Date.now(),
        });
        this.forEach((item, index) => {
            inspector.createModelItem({
                model: this.id,
                key: toDevValue(index),
                value: toDevValue(item),
            });
        });
        if (ctx instanceof DevReactive && name) {
            inspector.addContextState({
                id: ctx.id,
                name: name,
                stateId: this.id,
            });
        }
    }

    public destroy(): void {
        inspector.destroy({ id: this.id, time: Date.now() });
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
        inspector.updateModel({
            id: this.id,
            method: method,
            args: args.map(toDevValue),
            return: toDevValue(result),
        });
    }
}

export class DevSetModel<T> extends SetModel<T> implements Destroyable {
    public readonly id: number;

    public constructor(usage: StaticPosition, set?: T[], ctx?: Reactive, name?: string) {
        super(set, ctx);
        this.id = provideId();

        ctx?.bind(this);
        inspector.createModel({
            id: this.id,
            type: "set",
            usage: usage,
            time: Date.now(),
        });
        for (const item of this) {
            inspector.createModelItem({
                model: this.id,
                value: toDevValue(item),
            });
        }
        if (ctx instanceof DevReactive && name) {
            inspector.addContextState({
                id: ctx.id,
                name: name,
                stateId: this.id,
            });
        }
    }

    public destroy(): void {
        inspector.destroy({ id: this.id, time: Date.now() });
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
        inspector.updateModel({
            id: this.id,
            method: method,
            args: args.map(toDevValue),
            return: toDevValue(result),
        });
    }
}

export class DevMapModel<K, T> extends MapModel<K, T> implements Destroyable {
    public readonly id: number;

    public constructor(usage: StaticPosition, map?: [K, T][], ctx?: Reactive, name?: string) {
        super(map, ctx);
        this.id = provideId();

        ctx?.bind(this);
        inspector.createModel({
            id: this.id,
            type: "map",
            usage: usage,
            time: Date.now(),
        });
        for (const [key, value] of this.entries()) {
            inspector.createModelItem({
                model: this.id,
                key: toDevValue(key),
                value: toDevValue(value),
            });
        }
        if (ctx instanceof DevReactive && name) {
            inspector.addContextState({
                id: ctx.id,
                name: name,
                stateId: this.id,
            });
        }
    }

    public destroy(): void {
        inspector.destroy({ id: this.id, time: Date.now() });
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
        inspector.updateModel({
            id: this.id,
            method: method,
            args: args.map(toDevValue),
            return: toDevValue(result),
        });
    }
}
