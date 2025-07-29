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
    Tag,
} from "vasille";

type Magic<T extends object> = { [K in keyof T]: T[K] | IValue<T[K]> | undefined };

export function readValue<T>(v: T | IValue<T>): T {
    return v instanceof IValue ? v.$ : v;
}

interface SlotOptions<Node, Element, TagOptions extends object, T extends object> {
    model?: (input: T, ctx: Fragment<Node, Element, TagOptions>) => void;
    slot?: (ctx: Fragment<Node, Element, TagOptions>) => void;
}

export function Slot<Node, Element, TagOptions extends object, T extends object = {}>(
    ctx: Fragment<Node, Element, TagOptions>,
    options: Magic<SlotOptions<Node, Element, TagOptions, T>> & T,
) {
    const model = readValue(options.model);

    if (model) {
        if (model.length <= 1) {
            for (const key in options) {
                if (options[key] instanceof IValue) {
                    options[key] = options[key].$;
                }
            }
        } else {
            for (const key in options) {
                if (!(options[key] instanceof IValue)) {
                    options[key] = ctx.ref(options[key]);
                }
            }
        }

        model(options, ctx);
    } else {
        readValue(options.slot)?.(ctx);
    }
}

interface IfOptions {
    condition: unknown;
    slot?: () => void;
}

export function If<Node, Element, TagOptions extends object>(
    ctx: Fragment<Node, Element, TagOptions>,
    { condition, slot: magicSlot }: Magic<IfOptions>,
) {
    const slot = readValue(magicSlot);

    ctx.if(condition instanceof IValue ? (condition as IValue<unknown>) : ctx.ref(condition), slot ?? (() => {}));
}

export function ElseIf<Node, Element, TagOptions extends object>(
    ctx: Fragment<Node, Element, TagOptions>,
    { condition, slot: magicSlot }: Magic<IfOptions>,
) {
    const slot = readValue(magicSlot);

    ctx.elif(condition instanceof IValue ? (condition as IValue<unknown>) : ctx.ref(condition), slot ?? (() => {}));
}

interface ElseOptions {
    slot?: () => void;
}

export function Else<Node, Element, TagOptions extends object>(
    ctx: Fragment<Node, Element, TagOptions>,
    { slot: magicSlot }: Magic<ElseOptions>,
) {
    const slot = readValue(magicSlot);

    if (slot) {
        ctx.else(slot);
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
    ctx: Fragment<Node, Element, TagOptions>,
    { of, slot: magicSlot }: Magic<ForOptions<Node, Element, TagOptions, T, K, V>>,
) {
    const slot = readValue(magicSlot);

    if (of instanceof IValue) {
        ctx.create(
            new CoreWatch<Node, Element, TagOptions, T>(
                {
                    model: of,
                    slot: function (ctx, model) {
                        create(model, ctx);
                    },
                },
                ctx.runner,
            ),
        );
    } else if (of) {
        create(of, ctx);
    }

    function create(model: T, node: Fragment<Node, Element, TagOptions>) {
        if (!slot) {
            return;
        }

        if (model instanceof ArrayModel) {
            node.create(
                new ArrayView(
                    {
                        model,
                        slot: slot as unknown as (ctx: Fragment<Node, Element, TagOptions>, value: V, index: V) => void,
                    },
                    node.runner,
                ),
            );
        } else if (model instanceof MapModel) {
            node.create(
                new MapView(
                    {
                        model,
                        slot,
                    },
                    node.runner,
                ),
            );
        } else if (model instanceof SetModel) {
            node.create(
                new SetView(
                    {
                        model,
                        slot,
                    },
                    node.runner,
                ),
            );
        }
        // fallback if is used external Array/Map/Set
        else {
            console.warn("Vasille <For of/> fallback detected. Please provide reactive data.");

            if (model instanceof Array) {
                model.forEach((value: V) => {
                    slot(node, value as unknown as T, value as unknown as K);
                });
            } else if (model instanceof Map) {
                for (const [key, value] of model as Map<K, V>) {
                    slot(node, value as unknown as T, key);
                }
            } else if (model instanceof Set) {
                for (const value of model) {
                    slot(node, value as unknown as T, value as unknown as K);
                }
            } else {
                throw userError("wrong use of `<For of/>` component", "wrong-model");
            }
        }
    }
}

interface WatchOptions<Node, Element, TagOptions extends object, T> {
    model: T;
    slot?: (ctx: Fragment<Node, Element, TagOptions>, value: T) => void;
}

export function Watch<Node, Element, TagOptions extends object, T>(
    ctx: Fragment<Node, Element, TagOptions>,
    { model, slot: magicSlot }: Magic<WatchOptions<Node, Element, TagOptions, T>>,
) {
    const slot = readValue(magicSlot);

    if (slot && model instanceof IValue) {
        ctx.create(new CoreWatch({ model, slot }, ctx.runner));
    }
}

interface DebugOptions {
    model: unknown;
}

export function Debug<Node, Element, TagOptions extends object>(
    ctx: Fragment<Node, Element, TagOptions>,
    { model }: DebugOptions,
) {
    const value = model instanceof IValue ? model : ctx.ref(model);

    ctx.debug(value as IValue<unknown>);
}

interface DelayOptions<Node, Element, TagOptions extends object> {
    time?: number;
    slot?: (ctx: Fragment<Node, Element, TagOptions>) => unknown;
}

export function Delay<Node, Element, TagOptions extends object>(
    ctx: Fragment<Node, Element, TagOptions>,
    { time, slot }: Magic<DelayOptions<Node, Element, TagOptions>>,
) {
    const fragment = new Fragment({}, ctx.runner, ":timer");
    const dSlot = readValue(slot);
    let timer: number | undefined;

    ctx.create(fragment, function (node) {
        if (dSlot) {
            timer = setTimeout(() => {
                dSlot(node);
                timer = undefined;
            }, readValue(time)) as unknown as number;
        }
        node.runOnDestroy(() => {
            if (timer !== undefined) {
                clearTimeout(timer);
            }
        });
    });
}
