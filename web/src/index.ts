import { App, Fragment, Portal, reportError, Runner as IRunner } from "vasille";
import { Runner, TagOptions } from "vasille/web-runner";
import { mount as coreMount } from "vasille-jsx";
import { routeApp as coreRouteApp, WebRouterInitialization } from "vasille-router/web-router";

export { styleSheet } from "vasille-css";
export type { RawStyleProps as StyleProps, StyleSheetProps } from "./spec/css.js";
export type { ClassItem } from "./jsx-runtime.js";
export { safe } from "vasille";

export {
    view,
    view as component,
    view as compose,
    ensure,
    ref,
    expr,
    expr as bind,
    expr as calculate,
    expr as watch,
    set,
    Delay,
    For,
    Slot,
    Watch,
    awaited,
    store,
    model,
    setModel,
    mapModel,
    arrayModel,
    Switch,
    setErrorHandler,
    match,
} from "vasille-jsx";

export {
    type QueryParams,
    type ScreenProps,
    type RouteParameters,
    screen,
    screen as page,
    type FallbackScreenProps,
    type ErrorScreenProps,
} from "vasille-router";

export { Router, type WebRouterInitialization, type NavigationMode } from "vasille-router/web-router";

export { setMobileMaxWidth, setTabletMaxWidth, setLaptopMaxWidth } from "vasille-css";

export { context, impute, receive, share } from "vasille-context";

function createPortal(node: Fragment<Node, Element, TagOptions>) {
    const portal = new Portal<Node, Element, TagOptions>({ node: document.body }, node.runner);

    node.create(portal);

    return portal;
}

export function modal<T extends object>(
    modal: (node: Fragment<Node, Element, TagOptions>, input: T) => void,
    create: (node: Fragment<Node, Element, TagOptions>) => Portal<Node, Element, TagOptions> = createPortal,
): (input: T, node: Fragment<Node, Element, TagOptions>) => void {
    return function (props, node) {
        if (!node) {
            throw new Error("Vasille: Modal context is missing");
        }
        const portal = create(node);

        try {
            modal(portal, props);
        } catch (e) {
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
    create: (node: Fragment<Node, Element, TagOptions>) => Portal<Node, Element, TagOptions> = createPortal,
): (node: Fragment<Node, Element, TagOptions>, input: T, timeout?: number) => Promise<unknown> {
    return function (node, input, timeout) {
        return new Promise((resolve, reject) => {
            const portal = create(node);
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

export function mount<T>(element: Element, component: ($: T) => void, input: T): App<Node, Element, TagOptions> {
    return coreMount<Node, Element, TagOptions, T>(element, component, new Runner(window.document), input);
}

export function routerApp<Routes extends string>(
    init: WebRouterInitialization<Routes>,
    element?: Element,
): App<Node, Element, TagOptions> {
    return coreRouteApp(element ?? document.body, window, window.location, init);
}
