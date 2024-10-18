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

function dereference<T>(value: T | IValue<T>): T {
    return value instanceof IValue ? value.$ : value;
}

export function Adapter(this: Fragment, { node, slot }: Magic<{ node: Fragment; slot?: (this: Fragment) => void }>) {
    const dNode = dereference(node);
    const dSlot = dereference(slot);

    if (dNode && dSlot) {
        this.create(dNode, dSlot);
    }
}

export function Slot<T extends object = {}>(
    this: Fragment,
    options: Magic<{ model?: (() => void) | ((input: T) => void); slot?: (this: Fragment) => void }> & T,
) {
    const model = dereference(options.model);

    if (model) {
        model(options);
    } else {
        dereference(options.slot)?.call(this);
    }
}

export function If(this: Fragment, { condition, slot: magicSlot }: Magic<{ condition: boolean; slot?: () => void }>) {
    const slot = dereference(magicSlot);

    this.if(condition instanceof IValue ? condition : this.ref(condition), slot ?? (() => {}));
}

export function ElseIf(
    this: Fragment,
    { condition, slot: magicSlot }: Magic<{ condition: boolean; slot?: () => void }>,
) {
    const slot = dereference(magicSlot);

    this.elif(condition instanceof IValue ? condition : this.ref(condition), slot ?? (() => {}));
}

export function Else(this: Fragment, { slot: magicSlot }: Magic<{ slot?: () => void }>) {
    const slot = dereference(magicSlot);

    if (slot) {
        this.else(slot);
    }
}

export function For<
    T extends Set<unknown> | Map<unknown, unknown> | unknown[],
    K = T extends unknown[] ? number : T extends Set<infer R> ? R : T extends Map<infer R, unknown> ? R : never,
    V = T extends (infer R)[] ? R : T extends Set<infer R> ? R : T extends Map<unknown, infer R> ? R : never,
>(this: Fragment, { of, slot: magicSlot }: Magic<{ of: T; slot?: (this: Fragment, value: T, index: K) => void }>) {
    const slot = dereference(magicSlot);

    if (of instanceof IValue) {
        this.create(
            new CoreWatch(this, {
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
                new ArrayView<V>(node, {
                    model,
                    slot: function (value, index) {
                        slot.call(this, value, index);
                    },
                }),
            );
        } else if (model instanceof MapModel) {
            node.create(
                new MapView(node, {
                    model,
                    slot: function (value, index) {
                        slot.call(this, value, index);
                    },
                }),
            );
        } else if (model instanceof SetModel) {
            node.create(
                new SetView(node, {
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
    const slot = dereference(magicSlot);

    if (slot && model instanceof IValue) {
        this.create(new CoreWatch(this, { model, slot }));
    }
}

export function Debug(this: Fragment, { model }: { model: unknown }) {
    const value = model instanceof IValue ? model : this.ref(model);

    this.debug(value as IValue<unknown>);
}

export function Mount(this: Fragment, { bind }: Magic<{ bind: boolean }>) {
    const node = this;

    if (!(node instanceof Tag)) {
        throw userError("<Mount bind/> can be used only as direct child of html tags", "context-mismatch");
    }

    node.bindMount(bind instanceof IValue ? bind : node.ref(bind));
}

export function Show(this: Fragment, { bind }: Magic<{ bind: boolean }>) {
    const node = this;

    if (!(node instanceof Tag)) {
        throw userError("<Show bind/> can be used only as direct child of html tags", "context-mismatch");
    }

    node.bindShow(bind instanceof IValue ? bind : node.ref(bind));
}
