import { Fragment, IValue, Runner, safe, userError } from "vasille";
import {
    DevArrayModel,
    DevArrayView as DevCoreArrayView,
    DevFragment,
    DevIValue,
    DevMapModel,
    DevMapView,
    DevSetModel,
    DevSetView,
    DevSinglePassArrayView,
    DevSwitchedNode,
    DevWatch as DevCoreWatch,
    errorToString,
    inspector,
    StaticPosition,
} from "vasille/dev";

interface DevSlotOptions<Node, Element, TagOptions extends object, T extends object> {
    model?: (input: T, ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>) => void;
    slot?: (input: object, ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>) => void;
}

export function DevSlot<Node, Element, TagOptions extends object, T extends object = {}>(
    { model, slot, ...options }: DevSlotOptions<Node, Element, TagOptions, T> & T,
    ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
    defaultSlot: ((ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>) => void) | undefined,
    usage: StaticPosition,
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
        inspector.reportComponentSlotError({
            targetId: "id" in ctx && typeof ctx.id === "number" ? ctx.id : 0,
            error: errorToString(e),
            usage: usage,
            time: Date.now(),
        });
        console.error(e);
    }
}

interface DevSwitchOptions<Node, Element, TagOptions extends object> {
    cases: {
        $case: DevIValue<unknown>;
        slot: (ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>) => void;
    }[];
    default?: (ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>) => void;
    slot?: never;
}

export function DevSwitch<Node, Element, TagOptions extends object>(
    options: DevSwitchOptions<Node, Element, TagOptions>,
    ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
    _slot: undefined,
    usage: StaticPosition,
) {
    ctx.create(new DevSwitchedNode(usage, ctx.runner, options.cases, options.default));
}

interface DevForOptions<Node, Element, TagOptions extends object, T, Args extends unknown[]> {
    of: T;
    slot?: (ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>, ...args: Args) => void;
}

export function DevFor<
    Node,
    Element,
    TagOptions extends object,
    T extends Set<unknown> | Map<unknown, unknown> | unknown[],
    K = T extends unknown[] ? number : T extends Set<infer R> ? R : T extends Map<infer R, unknown> ? R : never,
    V = T extends (infer R)[] ? R : T extends Set<infer R> ? R : T extends Map<unknown, infer R> ? R : never,
>(
    { of: model, slot: _slot }: DevForOptions<Node, Element, TagOptions, T, [V, K]>,
    ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
    defaultSlot: ((ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>) => void) | undefined,
    usage: StaticPosition,
) {
    const slot = _slot ?? defaultSlot;

    console.warn(
        "Vasille <For of/> IS DEPRECATED. " +
            "Please use ArrayView/ArrayModelView/SetModelView/MapModelView/Iterate/ForEach.",
    );

    if (!slot) {
        return;
    }

    if (model instanceof DevArrayModel) {
        ctx.create(
            new DevCoreArrayView<Node, Element, TagOptions, V>(
                ctx.runner,
                model,
                (ctx, value, index) => {
                    slot(
                        ctx as Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
                        value,
                        index.V as K,
                    );
                },
                usage,
            ),
        );
    } else if (model instanceof DevMapModel) {
        ctx.create(
            new DevMapView(
                ctx.runner,
                model,
                (ctx, value, key) => {
                    slot(ctx as Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>, value.V, key);
                },
                usage,
                undefined,
            ),
        );
    } else if (model instanceof DevSetModel) {
        ctx.create(
            new DevSetView(
                ctx.runner,
                model,
                (ctx, value) => {
                    slot(
                        ctx as Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
                        value,
                        value as unknown as K,
                    );
                },
                usage,
            ),
        );
    }
    // fallback if is used external Array/Map/Set
    else {
        const safeSlot = safe(slot);

        console.warn("Vasille <For of/> fallback detected. Please use Iterate or ForEach.");

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

export function DevArrayView<
    Node,
    Element,
    TagOptions extends object,
    T extends unknown[],
    V = T extends (infer R)[] ? R : never,
>(
    props: Required<DevForOptions<Node, Element, TagOptions, IValue<V[]>, [IValue<V>, IValue<number>]>> & {
        key: (value: V) => number | string;
    },
    ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
    usage: StaticPosition,
    _defaultSlot: never,
    value: StaticPosition | undefined,
    index: StaticPosition | undefined,
) {
    ctx.create(
        new DevSinglePassArrayView<Node, Element, TagOptions, V>(
            ctx.runner,
            props.of,
            props.key,
            props.slot,
            usage,
            value,
            index,
        ),
    );
}

export function DevArrayModelView<Node, Element, TagOptions extends object, V>(
    props: Required<DevForOptions<Node, Element, TagOptions, DevArrayModel<V>, [V, IValue<number>]>>,
    ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
    _defaultSlot: never,
    usage: StaticPosition,
    index: StaticPosition | undefined,
) {
    ctx.create(new DevCoreArrayView<Node, Element, TagOptions, V>(ctx.runner, props.of, props.slot, usage, index));
}

export function DevMapModelView<Node, Element, TagOptions extends object, K, V>(
    props: Required<DevForOptions<Node, Element, TagOptions, DevMapModel<K, V>, [IValue<V>, K]>>,
    ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
    _defaultSlot: never,
    usage: StaticPosition,
    value: StaticPosition | undefined,
) {
    ctx.create(new DevMapView<Node, Element, TagOptions, K, V>(ctx.runner, props.of, props.slot, usage, value));
}

export function DevSetModelView<Node, Element, TagOptions extends object, V>(
    props: Required<DevForOptions<Node, Element, TagOptions, DevSetModel<V>, [V]>>,
    ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
    usage: StaticPosition,
) {
    ctx.create(new DevSetView<Node, Element, TagOptions, V>(ctx.runner, props.of, props.slot, usage));
}

interface DevWatchOptions<Node, Element, TagOptions extends object, T> {
    $model: DevIValue<T>;
    slot?: (ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>, value: T) => void;
}

export function DevWatch<Node, Element, TagOptions extends object, T>(
    { $model, slot: _slot }: DevWatchOptions<Node, Element, TagOptions, T>,
    ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
    defaultSlot: (ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>) => void | undefined,
    usage: StaticPosition,
) {
    const slot = _slot ?? defaultSlot;

    /* istanbul ignore else */
    if (slot) {
        ctx.create(new DevCoreWatch({ model: $model, slot: safe(slot) }, ctx.runner, usage));
    }
}

interface DevDelayOptions<Node, Element, TagOptions extends object> {
    time?: number;
    slot?: (ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>) => unknown;
}

export function DevDelay<Node, Element, TagOptions extends object>(
    { time, slot: _slot }: DevDelayOptions<Node, Element, TagOptions>,
    ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>,
    defaultSlot: (ctx: Fragment<Node, Element, TagOptions, Runner<Node, Element, TagOptions>>) => void | undefined,
    usage: StaticPosition,
) {
    const fragment = new DevFragment<Node, Element, TagOptions>(ctx.runner, null, usage, "Delay", {
        time,
        slot: _slot,
    });
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
