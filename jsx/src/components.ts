import {
    ArrayModel,
    ArrayView,
    Fragment,
    IValue,
    MapModel,
    MapView,
    SetModel,
    SetView,
    userError,
    Watch as CoreWatch,
} from "vasille";

interface SlotOptions<Node, Element, TagOptions extends object, T extends object> {
    model?: (input: T, ctx: Fragment<Node, Element, TagOptions>) => void;
    slot?: (ctx: Fragment<Node, Element, TagOptions>) => void;
}

export function Slot<Node, Element, TagOptions extends object, T extends object = {}>(
    { model, slot, ...options }: SlotOptions<Node, Element, TagOptions, T> & T,
    ctx: Fragment<Node, Element, TagOptions>,
    defaultSlot?: (ctx: Fragment<Node, Element, TagOptions>) => void,
) {
    if (model) {
        model(options as T, ctx);
    } else {
        (slot ?? defaultSlot)?.(ctx);
    }
}

interface ForOptions<Node, Element, TagOptions extends object, T, K, V> {
    of: T;
    slot?: (ctx: Fragment<Node, Element, TagOptions>, value: T, index: K) => void;
}

export function For<
    Node,
    Element,
    TagOptions extends object,
    T extends Set<unknown> | Map<unknown, unknown> | unknown[],
    K = T extends unknown[] ? number : T extends Set<infer R> ? R : T extends Map<infer R, unknown> ? R : never,
    V = T extends (infer R)[] ? R : T extends Set<infer R> ? R : T extends Map<unknown, infer R> ? R : never,
>(
    { of: model, slot: _slot }: ForOptions<Node, Element, TagOptions, T, K, V>,
    ctx: Fragment<Node, Element, TagOptions>,
    defaultSlot?: (ctx: Fragment<Node, Element, TagOptions>) => void,
) {
    const slot = _slot ?? defaultSlot;

    if (!slot) {
        return;
    }

    if (model instanceof ArrayModel) {
        ctx.create(
            new ArrayView(
                {
                    model,
                    slot: slot as unknown as (ctx: Fragment<Node, Element, TagOptions>, value: V, index: V) => void,
                },
                ctx.runner,
            ),
        );
    } else if (model instanceof MapModel) {
        ctx.create(
            new MapView(
                {
                    model,
                    slot,
                },
                ctx.runner,
            ),
        );
    } else if (model instanceof SetModel) {
        ctx.create(
            new SetView(
                {
                    model,
                    slot: slot as unknown as (
                        ctx: Fragment<Node, Element, TagOptions, object>,
                        value: T,
                        index: T,
                    ) => void,
                },
                ctx.runner,
            ),
        );
    }
    // fallback if is used external Array/Map/Set
    else {
        console.warn("Vasille <For of/> fallback detected. Please provide reactive data.");

        if (model instanceof Array) {
            model.forEach((value: V) => {
                slot(ctx, value as unknown as T, value as unknown as K);
            });
        } else if (model instanceof Map) {
            model.forEach((value: V, key: K) => {
                slot(ctx, value as unknown as T, key);
            });
        } else if (model instanceof Set) {
            model.forEach(value => {
                slot(ctx, value as unknown as T, value as unknown as K);
            });
        } else {
            throw userError("wrong use of `<For of/>` component", "wrong-model");
        }
    }
}

interface WatchOptions<Node, Element, TagOptions extends object, T> {
    $model: IValue<T>;
    slot?: (ctx: Fragment<Node, Element, TagOptions>, value: T) => void;
}

export function Watch<Node, Element, TagOptions extends object, T>(
    { $model, slot: _slot }: WatchOptions<Node, Element, TagOptions, T>,
    ctx: Fragment<Node, Element, TagOptions>,
    defaultSlot?: (ctx: Fragment<Node, Element, TagOptions>) => void,
) {
    const slot = _slot ?? defaultSlot;

    /* istanbul ignore else */
    if (slot) {
        ctx.create(new CoreWatch({ model: $model, slot }, ctx.runner));
    }
}

interface DebugOptions {
    $model: IValue<unknown>;
}

export function Debug<Node, Element, TagOptions extends object>(
    { $model }: DebugOptions,
    ctx: Fragment<Node, Element, TagOptions>,
) {
    ctx.debug($model);
}

interface DelayOptions<Node, Element, TagOptions extends object> {
    time?: number;
    slot?: (ctx: Fragment<Node, Element, TagOptions>) => unknown;
}

export function Delay<Node, Element, TagOptions extends object>(
    { time, slot: _slot }: DelayOptions<Node, Element, TagOptions>,
    ctx: Fragment<Node, Element, TagOptions>,
    defaultSlot?: (ctx: Fragment<Node, Element, TagOptions>) => void,
) {
    const fragment = new Fragment(ctx.runner);
    const slot = _slot ?? defaultSlot;
    let timer: number | undefined;

    ctx.create(fragment, function (node) {
        /* istanbul ignore else */
        if (slot) {
            timer = setTimeout(() => {
                slot(node);
                timer = undefined;
            }, time) as unknown as number;
        }
        node.runOnDestroy(() => {
            if (timer !== undefined) {
                clearTimeout(timer);
            }
        });
    });
}
