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

export function Adapter(ctx: Fragment, { node, slot }: Magic<{ node: Fragment; slot?: (ctx: Fragment) => void }>) {
    const dNode = readValue(node);
    const dSlot = readValue(slot);

    if (dNode && dSlot) {
        ctx.create(dNode, dSlot);
    }
}

export function Slot<T extends object = {}>(
    ctx: Fragment,
    options: Magic<{
        model?: (input: T, ctx: Fragment) => void;
        slot?: (ctx: Fragment) => void;
    }> &
        T,
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

export function If(ctx: Fragment, { condition, slot: magicSlot }: Magic<{ condition: unknown; slot?: () => void }>) {
    const slot = readValue(magicSlot);

    ctx.if(condition instanceof IValue ? (condition as IValue<unknown>) : ctx.ref(condition), slot ?? (() => {}));
}

export function ElseIf(
    ctx: Fragment,
    { condition, slot: magicSlot }: Magic<{ condition: unknown; slot?: () => void }>,
) {
    const slot = readValue(magicSlot);

    ctx.elif(condition instanceof IValue ? (condition as IValue<unknown>) : ctx.ref(condition), slot ?? (() => {}));
}

export function Else(ctx: Fragment, { slot: magicSlot }: Magic<{ slot?: () => void }>) {
    const slot = readValue(magicSlot);

    if (slot) {
        ctx.else(slot);
    }
}

export function For<
    T extends Set<unknown> | Map<unknown, unknown> | unknown[],
    K = T extends unknown[] ? number : T extends Set<infer R> ? R : T extends Map<infer R, unknown> ? R : never,
    V = T extends (infer R)[] ? R : T extends Set<infer R> ? R : T extends Map<unknown, infer R> ? R : never,
>(ctx: Fragment, { of, slot: magicSlot }: Magic<{ of: T; slot?: (ctx: Fragment, value: T, index: K) => void }>) {
    const slot = readValue(magicSlot);

    if (of instanceof IValue) {
        ctx.create(
            new CoreWatch({
                model: of,
                slot: function (ctx, model) {
                    create(model, ctx);
                },
            }),
        );
    } else if (of) {
        create(of, ctx);
    }

    function create(model: T, node: Fragment) {
        if (!slot) {
            return;
        }

        if (model instanceof ArrayModel) {
            node.create(
                new ArrayView<V>({
                    model,
                    slot: slot as unknown as (ctx: Fragment<object>, value: V, index: V) => void,
                }),
            );
        } else if (model instanceof MapModel) {
            node.create(
                new MapView({
                    model,
                    slot,
                }),
            );
        } else if (model instanceof SetModel) {
            node.create(
                new SetView({
                    model,
                    slot,
                }),
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

export function Watch<T>(
    ctx: Fragment,
    { model, slot: magicSlot }: Magic<{ model: T; slot?: (ctx: Fragment, value: T) => void }>,
) {
    const slot = readValue(magicSlot);

    if (slot && model instanceof IValue) {
        ctx.create(new CoreWatch({ model, slot }));
    }
}

export function Debug(ctx: Fragment, { model }: { model: unknown }) {
    const value = model instanceof IValue ? model : ctx.ref(model);

    ctx.debug(value as IValue<unknown>);
}

export function Mount(ctx: Fragment, { bind }: Magic<{ bind: unknown }>) {
    if (!(ctx instanceof Tag)) {
        throw userError("<Mount bind/> can be used only as direct child of html tags", "context-mismatch");
    }

    ctx.bindMount(bind instanceof IValue ? (bind as IValue<unknown>) : ctx.ref(bind));
}

export function Show(ctx: Fragment, { bind }: Magic<{ bind: unknown }>) {
    if (!(ctx instanceof Tag)) {
        throw userError("<Show bind/> can be used only as direct child of html tags", "context-mismatch");
    }

    ctx.bindShow(bind instanceof IValue ? (bind as IValue<unknown>) : ctx.ref(bind));
}

export function Delay(ctx: Fragment, { time, slot }: Magic<{ time?: number; slot?: (ctx: Fragment) => unknown }>) {
    const fragment = new Fragment({}, ":timer");
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
