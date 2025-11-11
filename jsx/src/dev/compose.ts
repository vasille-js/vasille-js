import { App, Destroyable, Fragment, Reactive, Runner } from "vasille";
import { CompositionProps } from "../compose.js";
import {
    DevApp,
    DevFragment,
    DevRunner,
    DevTagOptions,
    Inspector,
    Position,
    ProtocolStore,
    provideId,
} from "vasille/dev";

export type DevComposed<Node, Element, TagOptions extends object, In extends CompositionProps, Out> = (
    $: In & { callback?(data: Out | undefined): void },
    usage: Position,
    name: string,
    node?: DevFragment<Node, Element, TagOptions>,
    slot?: In["slot"],
) => void;

export function devView<Node, Element, TagOptions extends object, In extends CompositionProps, Out>(
    renderer: (node: Fragment<Node, Element, TagOptions>, input: In) => Out,
    declaration: Position,
): DevComposed<Node, Element, TagOptions, In, Out> {
    return function (props, usage, name, node, slot) {
        const { callback } = props;

        if (!node) {
            throw new Error("Vasille: Component context is missing");
        }
        const frag = new DevFragment<Node, Element, TagOptions>(
            node.runner,
            declaration,
            usage,
            name,
            props,
            node.inspector,
        );

        if (slot) {
            props.slot = slot;
        }
        node.create(frag);

        try {
            const result = renderer(frag, props);

            if (result !== undefined && result !== null && callback) {
                callback(result);
            }
        } catch (e) {
            node.inspector.reportComponentError({
                id: frag.id,
                error: e,
                name: name,
            });
            reportError(e);
        }
    };
}

export const stores = new Map<number, ProtocolStore>();

export function devStore<Out extends object>(
    fn: (ctx: Reactive) => Out,
    inspector: Inspector,
    declaration: Position,
    name: string,
): Out {
    const id = provideId();
    const reactive = new Reactive();

    stores.set(id, { id, declaration, name });

    return fn(reactive);
}

export function devModel<In extends object, Out extends object>(
    fn: (ctx: Reactive, o: In, inspector: Inspector) => Out,
    declaration: Position,
    name: string,
): (o: In, usage: Position, inspector: Inspector) => Out & Destroyable {
    return (o, usage, inspector) => {
        const ctx = new Reactive();
        const id = provideId();

        inspector.createCustomModel({ id, declaration, usage, name });

        return {
            ...fn(ctx, o, inspector),
            destroy() {
                ctx.destroy();
            },
        };
    };
}

export function devMount<T>(
    tag: Element,
    view: ($: T, node: DevFragment<Node, Element, DevTagOptions>) => unknown,
    runner: DevRunner,
    $: T,
    inspector: Inspector,
): App<Node, Element, DevTagOptions> {
    const root = new DevApp<Node, Element, DevTagOptions>(tag, runner, inspector);
    const frag = new DevFragment<Node, Element, DevTagOptions>(runner, null, null, "Root", {}, inspector);

    // share information about create stores
    for (const store of stores.values()) {
        inspector.createStore(store);
    }

    root.create(frag, function () {
        view($, frag);
    });

    return root;
}
