import { Fragment, Portal, reportError } from "vasille";
import { StyleProps } from "../spec/css.js";
import { Runner, TagOptions } from "vasille/web-runner";
import { mount as coreMount } from "vasille-jsx";
import { styleSheet as coreStyleSheet } from "vasille-css";
import { routeApp as coreRouteApp, WebRouterInitialization } from "vasille-router/web-router";

export type { RawStyleProps as StyleProps } from "../spec/css.js";
export type { ClassItem } from "./jsx-runtime.js";
export { safe } from "vasille";

export {
    view,
    view as component,
    view as compose,
    forward,
    backward,
    ensure,
    ref,
    expr,
    expr as bind,
    expr as calculate,
    expr as watch,
    set,
    Debug,
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
    extract,
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

export { Router, type WebRouterInitialization, type NavigationMode, routeApp } from "vasille-router/web-router";

export { setMobileMaxWidth, setTabletMaxWidth, setLaptopMaxWidth } from "vasille-css";

export const styleSheet = coreStyleSheet as <
    T extends {
        [className: string]: {
            [media: `@${string}`]: {
                [state: `:${string}`]: StyleProps;
            } & StyleProps;
            [state: `:${string}`]: StyleProps;
        } & StyleProps;
    },
>(
    input: T,
) => { [K in keyof T]: string };

function createPortal(node: Fragment<Node, Element, TagOptions>) {
    const portal = new Portal<Node, Element, TagOptions>({ node: document.body }, node.runner);

    node.create(portal);

    return portal;
}

export function modal<T extends object>(
    modal: (node: Fragment<Node, Element, TagOptions>, input: T) => void,
): (input: T, node: Fragment<Node, Element, TagOptions>) => void {
    return function (props, node) {
        if (!node) {
            throw new Error("Vasille: Modal context is missing");
        }
        const portal = createPortal(node);

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
): (node: Fragment<Node, Element, TagOptions>, input: T, timeout?: number) => Promise<unknown> {
    return function (node, input, timeout) {
        return new Promise((resolve, reject) => {
            const portal = createPortal(node);
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

export function mount<T>(element: Element, component: ($: T) => void, input: T, debugUi?: boolean) {
    return coreMount<Node, Element, TagOptions, T>(
        element,
        component,
        new Runner(debugUi ?? false, window.document),
        input,
    );
}

export function routerApp<Routes extends string>(
    init: WebRouterInitialization<Routes>,
    element?: Element,
    debugUi?: boolean,
) {
    return coreRouteApp(element ?? document.body, window, window.location, init, debugUi);
}
