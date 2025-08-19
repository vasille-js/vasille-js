import { StyleProps } from "../spec/css.js";
import { Runner, TagOptions } from "vasille/web-runner";
import { mount as coreMount } from "vasille-jsx";
import { styleSheet as coreStyleSheet } from "vasille-css";
import { routeApp as coreRouteApp, WebRouterInitialization } from "vasille-router/web-router";

export {
    view,
    view as component,
    view as compose,
    forward,
    backward,
    ensure,
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
    setErrorHandler,
} from "vasille-jsx";

export { QueryParams, ScreenProps, RouteParameters, screen } from "vasille-router";
export { Router, WebRouterInitialization, NavigationMode, routeApp } from "vasille-router/web-router";

export type { setMobileMaxWidth, setTabletMaxWidth, setLaptopMaxWidth } from "vasille-css";

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

export function mount<T>(element: Element, component: ($: T) => void, $: T, debugUi?: boolean) {
    return coreMount<Node, Element, TagOptions, T>(
        element,
        component,
        new Runner(debugUi ?? false, window.document),
        $,
    );
}

export function routerApp<Routes extends string>(
    init: WebRouterInitialization<Routes>,
    element?: Element,
    debugUi?: boolean,
) {
    return coreRouteApp(element ?? document.body, window, window.location, init, debugUi);
}
