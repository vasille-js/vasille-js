import { App, Fragment, Runner as IRunner } from "vasille";
import { TagOptions } from "vasille/web-runner";
import { devMount as coreMount, devDynamicalModule, DevFragmentMap } from "vasille-jsx/dev";
import { devRouteApp as coreRouteApp } from "vasille-router/dev";
import {
    DevPortal,
    DevRunner,
    DevTagOptions,
    errorToString,
    IDevRunner,
    Inspector,
    StaticPosition,
    toDevValue,
} from "vasille/dev";
import { modal, prompt, PromptProps } from "./index.js";
import { WebRouterInitialization } from "vasille-router/web-router";
import { CompositionProps } from "vasille-jsx";

function createPortal<Runner extends IDevRunner<Node, Element, TagOptions>>(
    node: Fragment<Node, Element, TagOptions>,
    declaration: StaticPosition | undefined,
    usage: StaticPosition | undefined,
    name: string | undefined,
) {
    const portal = new DevPortal<Node, Element, TagOptions, Runner>(
        { node: document.body },
        node.runner as Runner,
        declaration,
        usage,
        name,
    );

    node.create(portal);

    return portal;
}

export function devModal<T extends CompositionProps>(
    modalFn: (node: Fragment<Node, Element, TagOptions>, input: T) => void,
    declaration: StaticPosition,
    name: string,
): (input: T, node: Fragment<Node, Element, TagOptions>, slot?: T["slot"], usage?: StaticPosition) => void {
    const fragments: DevFragmentMap<Node, Element, TagOptions, T> = new Map();
    const run = function (parent: Fragment<Node, Element, TagOptions>, input: T, usage: StaticPosition | undefined) {
        modal<T>(modalFn, node => {
            const portal = createPortal(node, declaration, usage, name);
            const inspector = portal.runner.inspector;
            const event = {
                position: usage,
                target: portal.id,
            } as const;

            inspector.eventTrigger({
                eventName: "open",
                time: Date.now(),
                ...event,
            });
            portal.runOnDestroy(() => {
                portal.runner.inspector.eventTrigger({
                    eventName: "close",
                    time: Date.now(),
                    ...event,
                });
            });

            return portal;
        })(input, parent, undefined);
    };

    const renderer = (
        input: T,
        node?: Fragment<Node, Element, TagOptions>,
        slot?: T["slot"],
        usage?: StaticPosition,
    ) => {
        if (!node) {
            throw new Error("Vasille: Modal context is missing");
        }
        const frag = new Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>(
            node.runner as IDevRunner<Node, Element, TagOptions>,
        );

        if (!input.slot && slot) {
            input.slot = slot;
        }

        node.create(frag);
        fragments.set(frag, { props: input, node: frag, usage });
        run(frag, input, usage);
    };

    return devDynamicalModule(renderer, fragments, run);
}

export function devPrompt<T extends PromptProps>(
    modal: (node: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>, input: T) => void,
    declaration: StaticPosition,
    name: string,
): (
    node: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>,
    input: T,
    timeout: number | undefined,
    usage: StaticPosition | undefined,
) => Promise<unknown> {
    const fragments: DevFragmentMap<Node, Element, TagOptions, T> = new Map();
    const run = function (
        node: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>,
        input: T,
        timeout: number | undefined,
        usage: StaticPosition | undefined,
    ) {
        let target: number | null = null;
        let inspector: Inspector | null = null;
        const event: { position: StaticPosition | undefined } = {
            position: usage,
        };

        return prompt(modal, node => {
            const portal = createPortal(node, declaration, usage, name);

            target = portal.id;
            inspector = portal.runner.inspector;

            inspector.eventTrigger({
                eventName: "open",
                time: Date.now(),
                position: usage,
                target,
            });

            return portal;
        })(node, input, timeout, {
            resolve(data: unknown) {
                if (inspector && target) {
                    inspector.eventTrigger({
                        ...event,
                        eventName: "close",
                        time: Date.now(),
                        target,
                        result: {
                            value: toDevValue(data),
                        },
                    });
                }
            },
            reject(err: unknown) {
                if (inspector && target) {
                    inspector.eventTrigger({
                        ...event,
                        eventName: "close",
                        time: Date.now(),
                        target,
                        result: {
                            error: errorToString(err),
                        },
                    });
                }
            },
        });
    };
    const renderer = (
        node: Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>,
        input: T,
        timeout: number | undefined,
        usage: StaticPosition | undefined,
    ) => {
        const frag = new Fragment<Node, Element, TagOptions, IDevRunner<Node, Element, TagOptions>>(
            node.runner as IDevRunner<Node, Element, TagOptions>,
        );

        node.create(frag);
        fragments.set(frag, { props: input, node: frag, usage });
        return run(frag, input, timeout, usage);
    };

    return devDynamicalModule(renderer, fragments, (parent, input, usage) => {
        void run(parent, input, 0, usage);
    });
}

export function devMount<T>(element: Element, component: ($: T) => void, input: T, inspector: Inspector) {
    return coreMount<T>(element, component, new DevRunner(window.document, inspector), input, inspector);
}

export function devRouterApp<Routes extends string>(
    init: WebRouterInitialization<Routes>,
    element: Element,
    inspector: Inspector,
): App<Node, Element, DevTagOptions, IRunner<Node, Element, DevTagOptions>> {
    return coreRouteApp(element, window, window.location, init, inspector);
}
