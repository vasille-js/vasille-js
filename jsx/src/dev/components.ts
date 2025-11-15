import { reportError, safe, userError } from "vasille";
import {
    DevArrayModel,
    DevArrayView,
    DevFragment,
    DevIValue,
    DevMapModel,
    DevMapView,
    DevSetModel,
    DevSetView,
    DevSwitchedNode,
    DevWatch as DevCoreWatch,
    Position,
} from "vasille/dev";

interface DevSlotOptions<Node, Element, TagOptions extends object, T extends object> {
    model?: (input: T, ctx: DevFragment<Node, Element, TagOptions>) => void;
    slot?: (input: object, ctx: DevFragment<Node, Element, TagOptions>) => void;
}

export function DevSlot<Node, Element, TagOptions extends object, T extends object = {}>(
    { model, slot, ...options }: DevSlotOptions<Node, Element, TagOptions, T> & T,
    ctx: DevFragment<Node, Element, TagOptions>,
    defaultSlot: ((ctx: DevFragment<Node, Element, TagOptions>) => void) | undefined,
    usage: Position,
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
        ctx.inspector?.reportComponentSlotError({
            componentId: ctx.id,
            error: e,
            usage: usage,
        });
        reportError(e);
    }
}

interface DevSwitchOptions<Node, Element, TagOptions extends object> {
    cases: {
        $case: DevIValue<unknown>;
        slot: (ctx: DevFragment<Node, Element, TagOptions>) => void;
    }[];
    default?: (ctx: DevFragment<Node, Element, TagOptions>) => void;
    slot?: never;
}

export function DevSwitch<Node, Element, TagOptions extends object>(
    options: DevSwitchOptions<Node, Element, TagOptions>,
    ctx: DevFragment<Node, Element, TagOptions>,
    _slot: undefined,
    usage: Position,
) {
    ctx.create(new DevSwitchedNode(ctx.inspector, usage, ctx.runner, options.cases, options.default));
}

interface DevForOptions<Node, Element, TagOptions extends object, T, K, V> {
    of: T;
    slot?: (ctx: DevFragment<Node, Element, TagOptions>, value: T, index: K) => void;
}

export function DevFor<
    Node,
    Element,
    TagOptions extends object,
    T extends Set<unknown> | Map<unknown, unknown> | unknown[],
    K = T extends unknown[] ? number : T extends Set<infer R> ? R : T extends Map<infer R, unknown> ? R : never,
    V = T extends (infer R)[] ? R : T extends Set<infer R> ? R : T extends Map<unknown, infer R> ? R : never,
>(
    { of: model, slot: _slot }: DevForOptions<Node, Element, TagOptions, T, K, V>,
    ctx: DevFragment<Node, Element, TagOptions>,
    defaultSlot: ((ctx: DevFragment<Node, Element, TagOptions>) => void) | undefined,
    usage: Position,
) {
    const slot = _slot ?? defaultSlot;

    if (!slot) {
        return;
    }

    if (model instanceof DevArrayModel) {
        ctx.create(
            new DevArrayView(
                {
                    model,
                    slot: slot as unknown as (ctx: DevFragment<Node, Element, TagOptions>, value: V, index: V) => void,
                },
                ctx.runner,
                ctx.inspector,
                usage,
            ),
        );
    } else if (model instanceof DevMapModel) {
        ctx.create(
            new DevMapView(
                {
                    model,
                    slot,
                },
                ctx.runner,
                ctx.inspector,
                usage,
            ),
        );
    } else if (model instanceof DevSetModel) {
        ctx.create(
            new DevSetView(
                {
                    model,
                    slot: slot as unknown as (ctx: DevFragment<Node, Element, TagOptions>, value: T, index: T) => void,
                },
                ctx.runner,
                ctx.inspector,
                usage,
            ),
        );
    }
    // fallback if is used external Array/Map/Set
    else {
        const safeSlot = safe(slot);

        console.warn("Vasille <For of/> fallback detected. Please provide reactive data.");

        if (model instanceof Array) {
            model.forEach((value: V) => {
                safeSlot(ctx, value as unknown as T, value as unknown as K);
            });
        } else if (model instanceof Map) {
            model.forEach((value: V, key: K) => {
                safeSlot(ctx, value as unknown as T, key);
            });
        } else if (model instanceof Set) {
            model.forEach(value => {
                safeSlot(ctx, value as unknown as T, value as unknown as K);
            });
        } else {
            throw userError("wrong use of `<For of/>` component", "wrong-model");
        }
    }
}

interface DevWatchOptions<Node, Element, TagOptions extends object, T> {
    $model: DevIValue<T>;
    slot?: (ctx: DevFragment<Node, Element, TagOptions>, value: T) => void;
}

export function DevWatch<Node, Element, TagOptions extends object, T>(
    { $model, slot: _slot }: DevWatchOptions<Node, Element, TagOptions, T>,
    ctx: DevFragment<Node, Element, TagOptions>,
    defaultSlot: (ctx: DevFragment<Node, Element, TagOptions>) => void | undefined,
    usage: Position,
) {
    const slot = _slot ?? defaultSlot;

    /* istanbul ignore else */
    if (slot) {
        ctx.create(new DevCoreWatch({ model: $model, slot: safe(slot) }, ctx.runner, usage, ctx.inspector));
    }
}

interface DevDelayOptions<Node, Element, TagOptions extends object> {
    time?: number;
    slot?: (ctx: DevFragment<Node, Element, TagOptions>) => unknown;
}

export function DevDelay<Node, Element, TagOptions extends object>(
    { time, slot: _slot }: DevDelayOptions<Node, Element, TagOptions>,
    ctx: DevFragment<Node, Element, TagOptions>,
    defaultSlot: (ctx: DevFragment<Node, Element, TagOptions>) => void | undefined,
    usage: Position,
) {
    const fragment = new DevFragment<Node, Element, TagOptions>(
        ctx.runner,
        null,
        usage,
        "Delay",
        { time, slot: _slot },
        ctx.inspector,
    );
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
