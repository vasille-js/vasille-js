import {
    ArrayModel,
    ArrayView as CoreArrayView,
    SinglePassArrayView,
    Fragment,
    IValue,
    MapModel,
    MapView as CoreMapView,
    reportError,
    Runner,
    safe,
    SetModel,
    SetView as CoreSetView,
    SwitchedNode,
    userError,
    Watch as CoreWatch,
} from "vasille";
import { TagOptions } from "vasille/web-runner";
import { ref } from "./internal.js";

interface SlotOptions<Node, Element, TagOptions extends object, T extends object> {
    model?: (input: T, ctx: Fragment<Node, Element, TagOptions>) => void;
    slot?: (input: object, ctx: Fragment<Node, Element, TagOptions>) => void;
}

function frag<Node, Element, TagOptions extends object, TRunner extends Runner<Node, Element, TagOptions>>(
    runner: TRunner,
) {
    return new Fragment<Node, Element, TagOptions>(runner);
}

export function Slot<Node, Element, TagOptions extends object, T extends object = {}>(
    { model, slot, ...options }: SlotOptions<Node, Element, TagOptions, T> & T,
    ctx: Fragment<Node, Element, TagOptions>,
    defaultSlot?: (ctx: Fragment<Node, Element, TagOptions>) => void,
) {
    try {
        if (model) {
            model(options as T, ctx);
        } else if (slot) {
            slot({}, ctx);
        } else if (defaultSlot) {
            defaultSlot(ctx);
        }
    } catch (e) {
        reportError(e);
    }
}

interface SwitchOptions<Node, Element, TagOptions extends object> {
    cases: {
        $case: IValue<unknown>;
        slot: (ctx: Fragment<Node, Element, TagOptions>) => void;
    }[];
    default?: (ctx: Fragment<Node, Element, TagOptions>) => void;
    slot?: never;
}

export function Switch<Node, Element, TagOptions extends object>(
    options: SwitchOptions<Node, Element, TagOptions>,
    ctx: Fragment<Node, Element, TagOptions>,
) {
    ctx.create(new SwitchedNode(ctx.runner, options.cases, options.default));
}

interface ForOptions<Node, Element, TagOptions extends object, T, Args extends unknown[]> {
    of: T;
    slot?: (ctx: Fragment<Node, Element, TagOptions>, ...args: Args) => void;
}

export function For<
    Node,
    Element,
    TagOptions extends object,
    T extends Set<unknown> | Map<unknown, unknown> | unknown[],
    K = T extends unknown[] ? number : T extends Set<infer R> ? R : T extends Map<infer R, unknown> ? R : never,
    V = T extends (infer R)[] ? R : T extends Set<infer R> ? R : T extends Map<unknown, infer R> ? R : never,
>(
    { of: model, slot: _slot }: ForOptions<Node, Element, TagOptions, T, [V, K]>,
    ctx: Fragment<Node, Element, TagOptions>,
    defaultSlot?: (ctx: Fragment<Node, Element, TagOptions>) => void,
) {
    const slot = _slot ?? defaultSlot;

    if (!slot) {
        return;
    }

    if (model instanceof ArrayModel) {
        ctx.create(
            new CoreArrayView<V, Node, Element, TagOptions, Runner<Node, Element, TagOptions>>(
                ctx.runner,
                model,
                (ctx, value, index) => {
                    slot(ctx, value, index.V as K);
                },
                ref,
                frag,
            ),
        );
    } else if (model instanceof MapModel) {
        ctx.create(
            new CoreMapView<K, V, Node, Element, TagOptions, Runner<Node, Element, TagOptions>>(
                ctx.runner,
                model,
                (ctx, value, key) => {
                    slot(ctx, value.V, key);
                },
                ref,
                frag,
            ),
        );
    } else if (model instanceof SetModel) {
        ctx.create(
            new CoreSetView<V, Node, Element, TagOptions, Runner<Node, Element, TagOptions>>(
                ctx.runner,
                model,
                (ctx, value) => {
                    slot(ctx, value, value as unknown as K);
                },
                frag,
            ),
        );
    }
    // fallback if is used external Array/Map/Set
    else {
        const safeSlot = safe(slot);

        if (model instanceof Array) {
            model.forEach((value: V) => {
                safeSlot(ctx, value, value as unknown as K);
            });
        } else if (model instanceof Map) {
            model.forEach((value: V, key: K) => {
                safeSlot(ctx, value, key);
            });
        } else if (model instanceof Set) {
            model.forEach((value: V) => {
                safeSlot(ctx, value, value as unknown as K);
            });
        } else {
            throw userError("wrong use of `<For of/>` component", "wrong-model");
        }
    }
}

export function ArrayView<
    Node,
    Element,
    TagOptions extends object,
    T extends unknown[],
    V = T extends (infer R)[] ? R : never,
>(
    props: Required<ForOptions<Node, Element, TagOptions, IValue<V[]>, [IValue<V>, IValue<number>]>> & {
        key: (value: V) => number | string;
    },
    ctx: Fragment<Node, Element, TagOptions>,
) {
    ctx.create(
        new SinglePassArrayView<V, Node, Element, TagOptions, Runner<Node, Element, TagOptions>>(
            ctx.runner,
            props.of,
            props.key,
            props.slot,
            ref,
            ref,
            frag,
        ),
    );
}

export function ArrayModelView<Node, Element, TagOptions extends object, V>(
    props: Required<ForOptions<Node, Element, TagOptions, ArrayModel<V>, [V, IValue<number>]>>,
    ctx: Fragment<Node, Element, TagOptions>,
) {
    ctx.create(
        new CoreArrayView<V, Node, Element, TagOptions, Runner<Node, Element, TagOptions>>(
            ctx.runner,
            props.of,
            props.slot,
            ref,
            frag,
        ),
    );
}

export function MapModelView<Node, Element, TagOptions extends object, K, V>(
    props: Required<ForOptions<Node, Element, TagOptions, MapModel<K, V>, [IValue<V>, K]>>,
    ctx: Fragment<Node, Element, TagOptions>,
) {
    ctx.create(
        new CoreMapView<K, V, Node, Element, TagOptions, Runner<Node, Element, TagOptions>>(
            ctx.runner,
            props.of,
            props.slot,
            ref,
            frag,
        ),
    );
}

export function SetModelView<Node, Element, TagOptions extends object, V>(
    props: Required<ForOptions<Node, Element, TagOptions, SetModel<V>, [V]>>,
    ctx: Fragment<Node, Element, TagOptions>,
) {
    ctx.create(
        new CoreSetView<V, Node, Element, TagOptions, Runner<Node, Element, TagOptions>>(
            ctx.runner,
            props.of,
            props.slot,
            frag,
        ),
    );
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
        ctx.create(new CoreWatch({ model: $model, slot: safe(slot) }, ctx.runner));
    }
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
    const fragment = new Fragment<Node, Element, TagOptions>(ctx.runner);
    const slot = _slot ?? defaultSlot;
    let timer: number | undefined;

    ctx.create(fragment, function (node) {
        /* istanbul ignore else */
        if (slot) {
            timer = setTimeout(() => {
                safe(slot)(node);
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
