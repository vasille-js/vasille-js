import { Fragment, Portal, reportError } from "vasille";
import { Runner, TagOptions } from "vasille/web-runner";
import { mount as coreMount } from "vasille-jsx";
import { routeApp as coreRouteApp } from "vasille-router/web-router";
import { DevFragment, DevPortal, DevTagOptions, Inspector, Position } from "vasille/dev";

function getInspector(node: Fragment<Node, Element, TagOptions>) {
    return "inspector" in node ? (node.inspector as Inspector) : undefined;
}

function createPortal(
    node: Fragment<Node, Element, TagOptions>,
    declaration: Position | undefined,
    usage: Position | undefined,
    name: string | undefined,
) {
    const portal = new DevPortal<Node, Element, TagOptions>(
        { node: document.body },
        node.runner,
        getInspector(node),
        declaration,
        usage,
        name,
    );

    node.create(portal);

    return portal;
}

export function modal<T extends object>(
    modal: (node: Fragment<Node, Element, TagOptions>, input: T) => void,
    declaration: Position,
    name: string,
): (input: T, node: Fragment<Node, Element, TagOptions>, usage: Position | undefined) => void {
    return function (props, node, usage) {
        if (!node) {
            throw new Error("Vasille: Modal context is missing");
        }
        const portal = createPortal(node, declaration, usage, name);

        try {
            modal(portal, props);
        } catch (e) {
            getInspector(node)?.reportComponentError({
                id: portal.id,
                error: e,
                name: name,
            });
            reportError(e);
        }
    };
}

export interface PromptProps {
    resolve(data: unknown): void;
    reject(err: unknown): void;
}

export function prompt<T extends PromptProps>(
    modal: (node: Fragment<Node, Element, TagOptions>, input: T) => void,
    declaration: Position,
    name: string,
): (
    node: Fragment<Node, Element, TagOptions>,
    input: T,
    timeout: number | undefined,
    usage: Position | undefined,
) => Promise<unknown> {
    return function (node, input, timeout, usage) {
        return new Promise((resolve, reject) => {
            const portal = createPortal(node, declaration, usage, name);
            const timer =
                timeout &&
                setTimeout(() => {
                    destroy();
                    reject(new Error("Timeout"));
                }, timeout);

            function destroy() {
                timer && clearTimeout(timer);
                portal.destroy();
            }

            try {
                modal(portal, {
                    ...input,
                    resolve(value) {
                        destroy();
                        resolve(value);
                    },
                    reject(error) {
                        destroy();
                        reject(error);
                    },
                });
            } catch (e) {
                destroy();
                reject(e);
            }
        });
    };
}

export function mount<T>(element: Element, component: ($: T) => void, input: T) {
    return coreMount<Node, Element, TagOptions, T>(element, component, new Runner(window.document), input);
}

export function routerApp<Routes extends string>(init: WebRouterInitialization<Routes>, element?: Element) {
    return coreRouteApp(element ?? document.body, window, window.location, init);
}
