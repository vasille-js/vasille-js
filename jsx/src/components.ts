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
    current,
    Tag,
} from "vasille";
import { getCurrent } from "./inline";

type Magic<T extends object> = { [K in keyof T]: T[K] | IValue<T[K]> | undefined };

function dereference<T>(value: T | IValue<T>): T {
    return value instanceof IValue ? value.$ : value;
}

export function Adapter({ node, slot }: Magic<{ node: Fragment; slot?: () => void }>) {
    const dNode = dereference(node);

    if (dNode) {
        getCurrent().create(dNode, dereference(slot));
    }
}

export function Slot<T extends object = {}>(
    options: Magic<{ model?: (() => void) | ((input: T) => void); slot?: () => void }> & T,
) {
    const model = dereference(options.model);

    if (model) {
        model(options);
    } else {
        dereference(options.slot)?.();
    }
}

export function If({ condition, slot: magicSlot }: Magic<{ condition: boolean; slot?: () => void }>) {
    const slot = dereference(magicSlot);

    getCurrent().if(condition instanceof IValue ? condition : getCurrent().ref(condition), slot ?? (() => {}));
}

export function ElseIf({ condition, slot: magicSlot }: Magic<{ condition: boolean; slot?: () => void }>) {
    const slot = dereference(magicSlot);

    getCurrent().elif(condition instanceof IValue ? condition : getCurrent().ref(condition), slot ?? (() => {}));
}

export function Else({ slot: magicSlot }: Magic<{ slot?: () => void }>) {
    const slot = dereference(magicSlot);

    if (slot) {
        getCurrent().else(slot);
    }
}

export function For<
    T extends Set<unknown> | Map<unknown, unknown> | unknown[],
    K = T extends unknown[] ? number : T extends Set<infer R> ? R : T extends Map<infer R, unknown> ? R : never,
    V = T extends (infer R)[] ? R : T extends Set<infer R> ? R : T extends Map<unknown, infer R> ? R : never,
>({ of, slot: magicSlot }: Magic<{ of: T; slot?: (value: T, index: K) => void }>) {
    const slot = dereference(magicSlot);

    if (of instanceof IValue) {
        getCurrent()?.create(new CoreWatch({ model: of }), (node, model) => {
            create(model, node);
        });
    } else if (of) {
        create(of, getCurrent());
    }

    function create(model: T, node: Fragment) {
        if (!slot) {
            return;
        }

        if (model instanceof ArrayModel) {
            node.create(new ArrayView<V>({ model }), (node, value, index) => {
                node.runFunctional(slot, value as any, index as any);
            });
        } else if (model instanceof MapModel) {
            node.create(new MapView({ model }), (node, value: V, index) => {
                node.runFunctional(slot, value as any, index as any);
            });
        } else if (model instanceof SetModel) {
            node.create(new SetView({ model }), (node, value: V, index) => {
                node.runFunctional(slot, value as any, index as any);
            });
        }
        // fallback if is used external Array/Map/Set
        else {
            console.warn("Vasille <For of/> fallback detected. Please provide reactive data.");

            if (model instanceof Array) {
                model.forEach((value: V, index) => {
                    node.runFunctional(slot, value as any, index as any);
                });
            } else if (model instanceof Map) {
                for (const [key, value] of model as Map<K, V>) {
                    node.runFunctional(slot, value as any, key as any);
                }
            } else if (model instanceof Set) {
                for (const value of model) {
                    node.runFunctional(slot, value as any, value as any);
                }
            } else {
                throw userError("wrong use of `<For of/>` component", "wrong-model");
            }
        }
    }
}

export function Watch<T>({ model, slot: magicSlot }: Magic<{ model: T; slot?: (value: T) => void }>) {
    const slot = dereference(magicSlot);

    if (slot && model instanceof IValue) {
        getCurrent().create(new CoreWatch({ model }), (node, value) => {
            node.runFunctional(slot, value);
        });
    }
}

export function Debug({ model }: { model: unknown }) {
    const current = getCurrent();
    const value = model instanceof IValue ? model : current.ref(model);

    current.debug(value as IValue<unknown>);
}

export function Mount({ bind }: Magic<{ bind: boolean }>) {
    if (!(current instanceof Tag)) {
        throw userError("<Mount bind/> can be used only as direct child of html tags", "context-mismatch");
    }

    current.bindMount(bind instanceof IValue ? bind : current.ref(bind));
}

export function Show({ bind }: Magic<{ bind: boolean }>) {
    if (!(current instanceof Tag)) {
        throw userError("<Show bind/> can be used only as direct child of html tags", "context-mismatch");
    }

    current.bindShow(bind instanceof IValue ? bind : current.ref(bind));
}
