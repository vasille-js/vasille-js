import { Reactive } from "../core/core.js";
import { IValue } from "../core/ivalue.js";
import { Fragment } from "../node/node.js";
import { IRunner } from "../node/runner.js";
import { Listener } from "./listener.js";

type Arguments<T> = [number, number, T[]] | [number, number];

/**
 * Model based on Array class
 * @extends Array
 * @implements ListenableModel
 */
export class ArrayModel<T> extends Array<T> {
    public listener: Listener<Arguments<T>>;

    /**
     * @param data {Array} input data
     * @param ctx lifetime context of model
     */
    public constructor(data?: Array<T> | number, ctx?: Reactive) {
        super(typeof data === "number" ? data : 0);
        this.listener = new Listener();

        if (data instanceof Array) {
            super.push(...data);
        }
        ctx?.bind(this);
    }

    /* Array members */

    /**
     * Calls `Array.fill` and notify about changes
     * @param value {*} value to fill with
     * @param start {?number} begin index
     * @param end {?number} end index
     */
    public override fill(value: T, start?: number, end?: number): this {
        /* istanbul ignore else */
        if (!start) {
            start = 0;
        }
        /* istanbul ignore else */
        if (!end) {
            end = this.length;
        }

        for (let i = start; i < end; i++) {
            this[i] = value;
        }
        this.listener.emit(0, this.length, this);
        return this;
    }

    /**
     * Calls `Array.pop` and notify about changes
     * @return {*} removed value
     */
    public override pop(): T | undefined {
        /* istanbul ignore else */
        if (this.length > 0) {
            this.listener.emit(this.length - 1, 1);
            return super.pop();
        }
    }

    /**
     * Calls `Array.push` and notify about changes
     * @param items {...*} values to push
     * @return {number} new length of the array
     */
    public override push(...items: Array<T>): number {
        this.listener.emit(this.length, 0, items);
        super.push(...items);
        return this.length;
    }

    /**
     * Calls `Array.shift` and notify about changed
     * @return {*} the shifted value
     */
    public override shift(): T | undefined {
        /* istanbul ignore else */
        if (this.length > 0) {
            this.listener.emit(0, 1);
            return super.shift();
        }
    }

    /**
     * Calls `Array.splice` and notify about changed
     * @param start {number} start index
     * @param deleteCount {?number} delete count
     * @param items {...*}
     * @return {ArrayModel} a pointer to this
     */
    public override splice(start: number, deleteCount?: number, ...items: Array<T>): T[] {
        start = Math.min(start, this.length);
        deleteCount = typeof deleteCount === "number" ? deleteCount : this.length - start;
        this.listener.emit(start, deleteCount, items);

        return super.splice(start, deleteCount, ...items);
    }

    /**
     * Calls Array.unshift and notify about changed
     * @param items {...*} values to insert
     * @return {number} the length after prepending
     */
    public override unshift(...items: Array<T>): number {
        this.listener.emit(0, 0, items);
        return super.unshift(...items);
    }

    public replace(at: number, with_: T): this {
        this.listener.emit(at, 1, [with_]);
        this[at] = with_;
        return this;
    }

    public destroy(): void {
        this.splice(0);
    }
}

interface CacheItem<Node, Element, TagOptions extends object, Runner extends IRunner<Node, Element, TagOptions>> {
    frag: Fragment<Node, Element, TagOptions, Runner>;
    index: IValue<number>;
}

class BaseArrayView<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions>,
    CacheItemType extends CacheItem<Node, Element, TagOptions, Runner>,
> extends Fragment<Node, Element, TagOptions, Runner> {
    protected cache: CacheItemType[] = [];

    public override unmount(keepStructure: boolean) {
        super.unmount(keepStructure);
        this.cache.forEach(item => item.frag.unmount(true));
    }
    public override remount() {
        for (let i = this.cache.length - 1; i >= 0; i--) {
            this.cache[i]!.frag.remount();
        }
    }

    public override destroy(keepNodes?: boolean): void {
        for (let i = this.cache.length - 1; i >= 0; i--) {
            this.cache[i]?.frag.destroy(keepNodes);
        }
        super.destroy(keepNodes);
    }
}

export class ArrayView<
    T,
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions>,
> extends BaseArrayView<Node, Element, TagOptions, Runner, CacheItem<Node, Element, TagOptions, Runner>> {
    private apply: ((...args: Arguments<T>) => void) | undefined;

    public constructor(
        runner: Runner,
        private readonly model: ArrayModel<T>,
        private readonly slot: (
            ctx: Fragment<Node, Element, TagOptions, Runner>,
            value: T,
            index: IValue<number>,
        ) => void,
        private readonly ref: <T>(v: T) => IValue<T>,
        private readonly frag: (runner: Runner) => Fragment<Node, Element, TagOptions, Runner>,
    ) {
        super(runner);
    }

    public override compose() {
        const view = this;

        function apply(index: number, remove: number, values?: T[]) {
            const children: CacheItem<Node, Element, TagOptions, Runner>[] = view.cache;
            const toInsert: CacheItem<Node, Element, TagOptions, Runner>[] = [];
            const prev = children[index - 1]?.frag;
            const next = children[index + remove]?.frag;
            const length = values?.length || 0;
            const lastIndex = length - 1;

            // create new fragments
            for (let i = 0; i < length; i++) {
                toInsert[i] = {
                    frag: view.frag(view.runner),
                    index: view.ref(i + index),
                };
            }
            // locate new fragments
            for (let i = 0; i < length; i++) {
                toInsert[i]!.frag.link(
                    view,
                    i === 0 ? prev : toInsert[i - 1]!.frag,
                    i === lastIndex ? next : toInsert[i + 1]!.frag,
                );
            }

            // destroy removed nodes
            for (let i = 0; i < remove; i++) {
                children[index + i]?.frag.destroy();
            }

            // modify the cache
            children.splice(index, remove, ...toInsert);

            // update indexes of affected items in the cache
            for (let i = index + length; i < children.length; i++) {
                children[i]!.index.V = i;
            }

            // render new fragments content in reverse order
            for (let i = lastIndex; i >= 0; i--) {
                view.slot(toInsert[i]!.frag, (values as T[])[i] as T, toInsert[i]!.index);
            }
        }

        apply(0, 0, this.model);
        this.model.listener.on(apply);
        this.apply = apply;
    }

    public override destroy(keepNodes?: boolean) {
        /* istanbul ignore else */
        if (this.apply) {
            this.model.listener.off(this.apply);
        }
        super.destroy(keepNodes);
    }
}

interface KeyedCacheItem<T, Node, Element, TagOptions extends object, Runner extends IRunner<Node, Element, TagOptions>>
    extends CacheItem<Node, Element, TagOptions, Runner> {
    key: string | number;
    value: IValue<T>;
    moved: boolean;
    unmounted: boolean;
}

export class DiffingArrayView<
    T,
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions>,
> extends BaseArrayView<Node, Element, TagOptions, Runner, KeyedCacheItem<T, Node, Element, TagOptions, Runner>> {
    protected match: ((model: T[]) => void) | undefined;

    public constructor(
        runner: Runner,
        protected readonly model: IValue<T[]>,
        protected readonly key: (item: T) => number | string,
        protected readonly slot: (
            ctx: Fragment<Node, Element, TagOptions, Runner>,
            value: IValue<T>,
            index: IValue<number>,
        ) => void,
        protected readonly vRef: <T>(v: T) => IValue<T>,
        protected readonly iRef: <T>(v: T) => IValue<T>,
        protected readonly frag: (runner: Runner) => Fragment<Node, Element, TagOptions, Runner>,
    ) {
        super(runner);
    }

    protected addChild(
        newCache: KeyedCacheItem<T, Node, Element, TagOptions, Runner>[],
        key: number | string,
        modelItem: T,
        prev?: Fragment<Node, Element, TagOptions, Runner>,
        next?: Fragment<Node, Element, TagOptions, Runner>,
    ) {
        const frag = this.frag(this.runner);
        const index = this.iRef(newCache.length);
        const value = this.vRef(modelItem);
        const cache: KeyedCacheItem<T, Node, Element, TagOptions, Runner> = {
            frag: frag,
            key: key,
            value: value,
            moved: false,
            unmounted: false,
            index,
        };

        frag.link(this, prev, next);
        this.slot(frag, value, index);
        newCache.push(cache);

        return cache;
    }

    public override destroy(keepNodes?: boolean) {
        /* istanbul ignore else */
        if (this.match) {
            this.model.off(this.match);
        }
        super.destroy(keepNodes);
    }
}

export class SinglePassArrayView<
    T,
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions>,
> extends DiffingArrayView<T, Node, Element, TagOptions, Runner> {
    protected readonly existing = new Map<number | string, KeyedCacheItem<T, Node, Element, TagOptions, Runner>>();

    public override compose() {
        const view = this;
        const { existing } = this;

        function match(model: T[]) {
            const children = view.cache;
            const newCache: KeyedCacheItem<T, Node, Element, TagOptions, Runner>[] = [];
            const unmounted = new Set<KeyedCacheItem<T, Node, Element, TagOptions, Runner>>();
            const modelLength = model.length;
            const cacheLength = children.length;
            let modelIndex = 0;
            let cacheIndex = 0;

            while (
                modelIndex <= modelLength &&
                cacheIndex <= cacheLength &&
                !(modelIndex == modelLength && cacheIndex == cacheLength)
            ) {
                const modelItem = model[modelIndex];
                const cacheItem = children[cacheIndex];
                const key = modelItem ? view.key(modelItem) : null;
                const prev = newCache[modelIndex - 1];
                let present: KeyedCacheItem<T, Node, Element, TagOptions, Runner> | undefined;

                // ideal case, a match
                if (key === cacheItem?.key) {
                    cacheItem.value.V = modelItem!;
                    cacheItem.index.V = modelIndex;
                    newCache.push(cacheItem);
                    modelIndex++;
                    cacheIndex++;
                    continue;
                }

                // skip already unmounted items
                if (cacheItem?.moved || !modelItem) {
                    cacheIndex++;
                    /* istanbul ignore else */
                    if (cacheItem) {
                        if (cacheItem.moved) {
                            cacheItem.moved = false;
                        } else {
                            cacheItem.frag.unlink();
                            unmounted.add(cacheItem);
                            cacheItem.unmounted = true;
                        }
                    }
                }
                // the item is present in another position, move it
                else if ((present = existing.get(key!))) {
                    const frag = present.frag;
                    const presentIndex = present.index;
                    const presentValue = present.value;
                    const indexDiff = presentIndex.V - cacheIndex;
                    const removeLimit = modelLength < cacheLength ? cacheLength - modelLength + 2 : 4;

                    // remove items between if less than 5
                    if (indexDiff <= removeLimit && indexDiff > 0) {
                        while (cacheIndex < presentIndex.V) {
                            const item = children[cacheIndex]!;
                            item.frag.unmount(false);
                            item.unmounted = true;
                            unmounted.add(item);
                            cacheIndex++;
                        }
                    } else {
                        if (!present.unmounted) {
                            frag.unmount(false);
                        }
                        frag.link(view, prev?.frag, cacheItem?.frag);
                        frag.remount();
                        presentIndex.V = modelIndex;
                        presentValue.V = modelItem!;
                        present.moved = indexDiff > 0;
                        newCache.push(present);
                        modelIndex++;

                        // if was unmounted, remove it from the unmounted set
                        if (present.unmounted) {
                            unmounted.delete(present);
                            present.unmounted = false;
                        }
                    }
                }
                // add missing items
                else {
                    /* istanbul ignore else */
                    if (key !== null && modelItem) {
                        existing.set(key, view.addChild(newCache, key, modelItem, prev?.frag, cacheItem?.frag));
                        modelIndex++;
                    }
                }
            }

            // destroy removed nodes
            unmounted.forEach(item => {
                existing.delete(item.key);
                item.frag.destroy();
            });

            view.cache = newCache;
        }

        match(this.model.V);
        this.model.on(match);
        this.match = match;
    }
}

// export class MultiPassArrayView<
//     T,
//     Node,
//     Element,
//     TagOptions extends object,
//     Runner extends IRunner<Node, Element, TagOptions>,
// > extends DiffingArrayView<T, Node, Element, TagOptions, Runner> {
//     public override compose() {
//         const view = this;
//
//         function match(model: T[]) {
//             const children = view.cache;
//             const newCache: KeyedCacheItem<T, Node, Element, TagOptions, Runner>[] = [];
//             const modelKeys = new Set<number | string>();
//             const modelData: { item: T; key: number | string }[] = [];
//
//             // pass 1, transform model data to keyed data
//             for (let i = 0; i < model.length; i++) {
//                 const modelItem = model[i] as T;
//                 const key = view.key(modelItem);
//                 modelKeys.add(key);
//                 modelData.push({ item: modelItem, key });
//             }
//
//             let gt = 0,
//                 lt = 0;
//
//             // pass 2, destroy unexisting items
//             for (let i = 0; i < children.length; i++) {
//                 const cacheItem = children[i]!;
//                 const key = cacheItem.key;
//
//                 if (!modelKeys.has(key)) {
//                     const { next, prev } = cacheItem.frag;
//
//                     if (prev) {
//                         prev.next = next;
//                     }
//                     if (next) {
//                         next.prev = prev;
//                     }
//
//                     cacheItem.unmounted = true;
//                     cacheItem.frag.destroy();
//                 }
//             }
//
//             const modelLength = model.length;
//             const cacheLength = children.length;
//             let modelIndex = 0;
//             let cacheIndex = 0;
//
//             // pass 3, create new items
//             while (modelIndex < modelLength && cacheIndex <= cacheLength) {
//                 const modelItem = modelData[modelIndex]!;
//                 const cacheItem = children[cacheIndex];
//                 const key = modelItem.key;
//
//                 // ideal case, a match
//                 if (key === cacheItem?.key) {
//                     cacheItem.value.V = modelItem.item;
//                     cacheItem.index.V = modelIndex;
//                     newCache.push(cacheItem);
//                     modelIndex++;
//                     cacheIndex++;
//                 }
//                 // skip unmounted items in step 2
//                 else if (cacheItem?.unmounted) {
//                     cacheIndex++;
//                 }
//                 // add missing items
//                 else {
//                     view.addChild(newCache, key, modelItem.item, newCache[modelIndex - 1]?.frag, cacheItem?.frag);
//                     modelIndex++;
//                 }
//             }
//
//             view.cache = newCache;
//         }
//
//         match(this.model.V);
//         this.model.on(match);
//         this.match = match;
//     }
// }
