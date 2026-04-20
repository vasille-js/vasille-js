import { Reactive } from "../core/core.js";
import { IValue } from "../core/ivalue.js";
import { safe } from "../functional/safety.js";
import { Fragment } from "../node/node.js";
import { IRunner } from "../node/runner.js";
import { Listener, removeFragmentFromTree } from "./listener.js";

const enum Ops {
    Clear,
    Add,
    Remove,
}

type Arguments<K, T> = [Ops.Clear] | [Ops.Remove, K] | [Ops.Add, K, T];

/**
 * A `Map` based memory
 * @class MapModel
 * @extends Map
 */
export class MapModel<K, T> extends Map<K, T> {
    public readonly listener: Listener<Arguments<K, T>>;
    public readonly rDeep: number;

    /**
     * Constructs a map model
     * @param map {[*, *][]} input data
     * @param ctx lifetime context
     */
    public constructor(map?: [K, T][], ctx?: Reactive) {
        super();
        this.listener = new Listener();

        map?.forEach(([key, value]) => {
            super.set(key, value);
        });
        this.rDeep = ctx?.sDeep || 0;
    }

    /**
     * Calls `Map.clear` and notify about changes
     */
    public override clear() {
        this.listener.emit(Ops.Clear);
        super.clear();
    }

    /**
     * Calls `Map.delete` and notify abut changes
     * @param key {*} key
     * @return {boolean} true if removed something, otherwise false
     */
    public override delete(key: K): boolean {
        this.listener.emit(Ops.Remove, key);
        return super.delete(key);
    }

    /**
     * Calls `Map.set` and notify abut changes
     * @param key {*} key
     * @param value {*} value
     * @return {MapModel} a pointer to this
     */
    public override set(key: K, value: T): this {
        this.listener.emit(Ops.Add, key, value);
        return super.set(key, value);
    }
}

export class MapView<
    K,
    T,
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions>,
> extends Fragment<Node, Element, TagOptions, Runner> {
    private map = new Map<
        K,
        {
            frag: Fragment<Node, Element, TagOptions, Runner>;
            value: IValue<T>;
        }
    >();
    private acceptUpdate: ((...args: Arguments<K, T>) => void) | undefined;
    private readonly slot: (ctx: Fragment<Node, Element, TagOptions, Runner>, value: IValue<T>, key: K) => void;

    public constructor(
        runner: Runner,
        deep: number,
        private readonly model: MapModel<K, T>,
        slot: (ctx: Fragment<Node, Element, TagOptions, Runner>, value: IValue<T>, key: K) => void,
        private readonly ref: <T>(v: T) => IValue<T>,
        private readonly frag: (runner: Runner, deep: number) => Fragment<Node, Element, TagOptions, Runner>,
    ) {
        super(runner, deep);
        this.slot = safe(slot);
    }

    public override compose() {
        const view = this;

        function create(this: void, key: K, value: T) {
            const frag = view.frag(view.runner, view.sDeep + 1);
            const ref = view.ref(value);

            frag.link(view, view.last, undefined);
            view.slot(frag, ref, key);
            view.map.set(key, { frag, value: ref });
            view.last = frag;
        }
        function acceptUpdate(this: void, op: Ops, key?: K, value?: T) {
            if (op === Ops.Add) {
                const existing = view.map.get(key!);

                if (existing) {
                    existing.value.V = value!;
                } else {
                    create(key!, value!);
                }
            } else if (op === Ops.Remove) {
                const item = view.map.get(key!);

                /* istanbul ignore else */
                if (item) {
                    removeFragmentFromTree(item.frag);
                    item.frag.destroy(item.frag.sDeep);
                    view.map.delete(key!);
                }
            } else {
                view.map.forEach(({ frag }) => frag.destroy(frag.sDeep));
                view.map.clear();
                view.last = undefined;
            }
        }

        this.model.forEach((value, key) => create(key, value));
        this.model.listener.on(acceptUpdate);
        this.acceptUpdate = acceptUpdate;
    }

    public override unmount(keepStructure: boolean) {
        super.unmount(keepStructure);
        this.map.forEach(item => item.frag.unmount(true));
    }
    public override remount() {
        [...this.map.values()].reverse().forEach(item => item.frag.remount());
    }

    public override destroy(deep: number, keepNodes?: boolean): void {
        /* istanbul ignore else */
        if (this.acceptUpdate && this.model.rDeep < deep) {
            this.model.listener.off(this.acceptUpdate);
        }
        this.map.forEach(({ frag }) => {
            /* istanbul ignore else */
            if (frag.rDeep < deep || !keepNodes) {
                frag.destroy(deep, keepNodes);
            }
        });
        super.destroy(deep, keepNodes);
    }
}
