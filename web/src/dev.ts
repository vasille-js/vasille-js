import { Fragment } from "vasille";
import { TagOptions } from "vasille/web-runner";
import { devMount as coreMount } from "vasille-jsx/dev";
import { devRouteApp as coreRouteApp } from "vasille-router/dev";
import { DevPortal, DevRunner, errorToString, IDevRunner, Inspector, StaticPosition, toDevValue } from "vasille/dev";
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
    return (input, node, slot, usage) => {
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
        })(input, node, slot);
    };
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
    return function (node, input, timeout, usage) {
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
}

export function devMount<T>(element: Element, component: ($: T) => void, input: T, inspector: Inspector) {
    return coreMount<T>(element, component, new DevRunner(window.document, inspector), input, inspector);
}

export function devRouterApp<Routes extends string>(
    init: WebRouterInitialization<Routes>,
    element: Element,
    inspector: Inspector,
) {
    return coreRouteApp(element, window, window.location, init, inspector);
}
