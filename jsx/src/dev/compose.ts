import { App, Destroyable, Fragment, Reactive } from "vasille";
import { DevReactive, StaticPosition } from "vasille/dev";
import { IDevRunner } from "vasille/dev";
import { CompositionProps } from "../compose.js";
import { DevApp, DevFragment, DevRunner, DevTagOptions, Inspector, ModelId } from "vasille/dev";
import { earlyInspector } from "./early-inspector.js";

export type DevComposed<Node, Element, TagOptions extends object, In extends CompositionProps, Out> = (
    $: In & { callback?(data: Out | undefined): void },
    node?: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>,
    slot?: In["slot"],
    usage?: StaticPosition,
) => void;

export function devView<Node, Element, TagOptions extends object, In extends CompositionProps, Out>(
    renderer: (node: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>, input: In) => Out,
    declaration: StaticPosition,
    name: string,
): DevComposed<Node, Element, TagOptions, In, Out> {
    return function (props, node, slot, usage) {
        const { callback } = props;

        if (!node) {
            throw new Error("Vasille: Component context is missing");
        }
        const frag = new DevFragment<Node, Element, TagOptions>(node.runner, declaration, usage ?? null, name, props);

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
            node.runner.inspector.reportComponentError({
                id: frag.id,
                error: e,
                name: name,
            });
            reportError(e);
        }
    };
}

export function devStore<Out extends object>(
    fn: (ctx: Reactive) => Out,
    declaration: StaticPosition,
    name: string,
): Out {
    const reactive = new DevReactive({ inspector: earlyInspector });

    earlyInspector.createStore({ id: reactive.id, declaration, name });

    return fn(reactive);
}

export function devModel<In extends object, Out extends object>(
    fn: (ctx: DevReactive<IDevRunner<unknown, unknown, object>>, o: In) => Out,
    declaration: StaticPosition,
    name: string,
): (o: In, usage: StaticPosition, runner: IDevRunner<unknown, unknown, object>) => Out & Destroyable {
    return (o, usage, runner) => {
        const ctx = new DevReactive(runner);
        const id = ctx.id;

        runner.inspector.createCustomModel({ id, declaration, usage, name });

        return {
            ...fn(ctx, o),
            destroy() {
                ctx.destroy();
            },
            [ModelId]: id,
        };
    };
}

export function devMount<T>(
    tag: Element,
    view: ($: T, node: Fragment<Node, Element, DevTagOptions, IDevRunner<Node, Element, DevTagOptions>>) => unknown,
    runner: DevRunner,
    $: T,
    inspector: Inspector,
): App<Node, Element, DevTagOptions> {
    const root = new DevApp<Node, Element, DevTagOptions>(tag, runner);
    const frag = new DevFragment<Node, Element, DevTagOptions>(runner, null, null, "Root", {});

    // share information about created stores
    earlyInspector.connect(inspector);

    root.create(frag, function () {
        view($, frag);
    });

    return root;
}
