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
import { readValue } from "./inline";

type Magic<T extends object> = { [K in keyof T]: T[K] | IValue<T[K]> | undefined };

export function Adapter(this: Fragment, { node, slot }: Magic<{ node: Fragment; slot?: (this: Fragment) => void }>) {
    const dNode = readValue(node);
    const dSlot = readValue(slot);

    if (dNode && dSlot) {
        this.create(dNode, dSlot);
    }
}

export function Slot<T extends object = {}>(
    this: Fragment,
    options: Magic<{
        model?: ((this: Fragment) => void) | ((this: Fragment, input: T) => void);
        slot?: (this: Fragment) => void;
    }> &
        T,
) {
    const model = readValue(options.model);

    if (model) {
        model.call(this, options);
    } else {
        readValue(options.slot)?.call(this);
    }
}

export function If(this: Fragment, { condition, slot: magicSlot }: Magic<{ condition: unknown; slot?: () => void }>) {
    const slot = readValue(magicSlot);

    this.if(condition instanceof IValue ? (condition as IValue<unknown>) : this.ref(condition), slot ?? (() => {}));
}

export function ElseIf(
    this: Fragment,
    { condition, slot: magicSlot }: Magic<{ condition: unknown; slot?: () => void }>,
) {
    const slot = readValue(magicSlot);

    this.elif(condition instanceof IValue ? (condition as IValue<unknown>) : this.ref(condition), slot ?? (() => {}));
}

export function Else(this: Fragment, { slot: magicSlot }: Magic<{ slot?: () => void }>) {
    const slot = readValue(magicSlot);

    if (slot) {
        this.else(slot);
    }
}

export function For<
    T extends Set<unknown> | Map<unknown, unknown> | unknown[],
    K = T extends unknown[] ? number : T extends Set<infer R> ? R : T extends Map<infer R, unknown> ? R : never,
    V = T extends (infer R)[] ? R : T extends Set<infer R> ? R : T extends Map<unknown, infer R> ? R : never,
>(this: Fragment, { of, slot: magicSlot }: Magic<{ of: T; slot?: (this: Fragment, value: T, index: K) => void }>) {
    const slot = readValue(magicSlot);

    if (of instanceof IValue) {
        this.create(
            new CoreWatch({
                model: of,
                slot: function (model) {
                    create(model, this);
                },
            }),
        );
    } else if (of) {
        create(of, this);
    }

    function create(model: T, node: Fragment) {
        if (!slot) {
            return;
        }

        if (model instanceof ArrayModel) {
            node.create(
                new ArrayView<V>({
                    model,
                    slot: function (value, index) {
                        slot.call(this, value, index);
                    },
                }),
            );
        } else if (model instanceof MapModel) {
            node.create(
                new MapView({
                    model,
                    slot: function (value, index) {
                        slot.call(this, value, index);
                    },
                }),
            );
        } else if (model instanceof SetModel) {
            node.create(
                new SetView({
                    model,
                    slot: function (value, index) {
                        slot.call(this, value, index);
                    },
                }),
            );
        }
        // fallback if is used external Array/Map/Set
        else {
            console.warn("Vasille <For of/> fallback detected. Please provide reactive data.");

            if (model instanceof Array) {
                model.forEach((value: V, index) => {
                    slot.call(node, value, index);
                });
            } else if (model instanceof Map) {
                for (const [key, value] of model as Map<K, V>) {
                    slot.call(node, value, key);
                }
            } else if (model instanceof Set) {
                for (const value of model) {
                    slot.call(node, value, value);
                }
            } else {
                throw userError("wrong use of `<For of/>` component", "wrong-model");
            }
        }
    }
}

export function Watch<T>(this: Fragment, { model, slot: magicSlot }: Magic<{ model: T; slot?: (value: T) => void }>) {
    const slot = readValue(magicSlot);

    if (slot && model instanceof IValue) {
        this.create(new CoreWatch({ model, slot }));
    }
}

export function Debug(this: Fragment, { model }: { model: unknown }) {
    const value = model instanceof IValue ? model : this.ref(model);

    this.debug(value as IValue<unknown>);
}

export function Mount(this: Fragment, { bind }: Magic<{ bind: unknown }>) {
    const node = this;

    if (!(node instanceof Tag)) {
        throw userError("<Mount bind/> can be used only as direct child of html tags", "context-mismatch");
    }

    node.bindMount(bind instanceof IValue ? (bind as IValue<unknown>) : node.ref(bind));
}

export function Show(this: Fragment, { bind }: Magic<{ bind: unknown }>) {
    const node = this;

    if (!(node instanceof Tag)) {
        throw userError("<Show bind/> can be used only as direct child of html tags", "context-mismatch");
    }

    node.bindShow(bind instanceof IValue ? (bind as IValue<unknown>) : node.ref(bind));
}

export function Delay(this: Fragment, { time, slot }: Magic<{ time?: number; slot?: (this: Fragment) => {} }>) {
    const fragment = new Fragment({}, ":timer");
    const dSlot = readValue(slot);
    let timer: number | undefined;

    this.create(fragment, function () {
        if (dSlot) {
            timer = setTimeout(() => {
                dSlot.call(this);
                timer = undefined;
            }, readValue(time)) as unknown as number;
        }
        this.runOnDestroy(() => {
            if (timer !== undefined) {
                clearTimeout(timer);
            }
        });
    });
}
