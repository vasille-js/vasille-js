import { App, Fragment, Reactive, reportError } from "vasille";
import { DevReactive, errorToString, remapObject, StaticPosition, toDevIdOrValue } from "vasille/dev";
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

export type DevInput<In, Out> = In & { callback?(data: Out | undefined): void };

export type DevFragmentMap<Node, Element, TagOptions extends object, In> = Map<
    Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>,
    {
        props: In;
        node: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>;
        usage: StaticPosition | undefined;
    }
>;

export function devDynamicalModule<T, Node, Element, TagOptions extends object, Props>(
    composed: T,
    fragments: DevFragmentMap<Node, Element, TagOptions, Props>,
    safeRun: (
        parent: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>,
        props: Props,
        usage: StaticPosition | undefined,
    ) => void,
): T {
    Object.defineProperties(composed, {
        fragments: {
            value: fragments,
        },
        recompose: {
            value: function (previous: DevFragmentMap<Node, Element, TagOptions, Props>) {
                // inspector erase declaration
                previous.forEach(({ props, node, usage }, key) => {
                    node.children.forEach(child => child.destroy());
                    node.children.splice(0);
                    safeRun(node, props, usage);
                    fragments.set(key, { props, node, usage });
                });
            },
        },
    });

    return composed;
}

export function devView<Node, Element, TagOptions extends object, In extends CompositionProps, Out>(
    renderer: (node: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>, input: In) => Out,
    declaration: StaticPosition,
    name: string,
): DevComposed<Node, Element, TagOptions, In, Out> {
    const fragments: DevFragmentMap<Node, Element, TagOptions, DevInput<In, Out>> = new Map();
    const safeRun = function (
        parent: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>,
        props: DevInput<In, Out>,
        usage: StaticPosition | undefined,
    ) {
        const { callback } = props;
        const frag = new DevFragment<Node, Element, TagOptions>(parent.runner, declaration, usage ?? null, name, props);

        parent.create(frag);

        try {
            const result = renderer(frag, props);

            if (result !== undefined && result !== null && callback) {
                callback(result);
            }
        } catch (e) {
            parent.runner.inspector.reportComponentError({
                targetId: frag.id,
                error: errorToString(e),
                time: Date.now(),
            });
            reportError(e);
        } finally {
            parent.runner.inspector.composeTime({
                id: frag.id,
                time: Date.now(),
            });
        }
    };
    const composed: DevComposed<Node, Element, TagOptions, In, Out> = function (props, node, slot, usage) {
        if (!node) {
            throw new Error("Vasille: Component context is missing");
        }
        const frag = new Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>(node.runner);

        if (slot) {
            props.slot = slot;
        }

        node.create(frag);
        fragments.set(frag, { props, node: frag, usage });
        frag.runOnDestroy(() => fragments.delete(frag));
        safeRun(frag, props, usage);
    };

    return devDynamicalModule(composed, fragments, safeRun);
}

export function devStore<Out extends object>(
    fn: (ctx: Reactive) => Out,
    declaration: StaticPosition,
    name: string,
): Out {
    const reactive = new DevReactive({ inspector: earlyInspector });

    earlyInspector.createStore({ id: reactive.id, declaration, name, time: Date.now() });

    return fn(reactive);
}

export function devModel<In extends object, Out extends object>(
    fn: (ctx: DevReactive<IDevRunner<unknown, unknown, object>>, o: In) => Out,
    declaration: StaticPosition,
    name: string,
): (o: In, parent: Reactive | undefined, usage: StaticPosition) => Out {
    return (o, parent, usage) => {
        const ctx = new DevReactive({ inspector: earlyInspector });
        const id = ctx.id;

        earlyInspector.createCustomModel({
            id,
            declaration,
            usage,
            name,
            time: Date.now(),
            props: remapObject(o as { [k: string]: unknown }, toDevIdOrValue),
        });
        if (parent) {
            parent.runOnDestroy(() => ctx.destroy());
        }

        return {
            ...fn(ctx, o),
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
