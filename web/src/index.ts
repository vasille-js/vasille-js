import { StyleProps } from "../spec/css.js";
import { Runner, TagOptions } from "vasille/web-runner";
import { mount as coreMount } from "vasille-dx";
import { styleSheet as coreStyleSheet } from "vasille-css";
import { routeApp as coreRouteApp, WebRouterInitialization } from "vasille-router/web-router";

export { $ } from "vasille-jsx";

export { compose, Debug, Delay, Else, ElseIf, For, If, Slot, Watch, awaited, store } from "vasille-dx";
export type {
    ref,
    bind,
    calculate,
    forward,
    arrayModel,
    setModel,
    mapModel,
    reactiveObject,
    value,
    watch,
} from "vasille-dx";

export { QueryParams, ScreenProps, RouteParameters } from "vasille-router";
export { Router, WebRouterInitialization, NavigationMode } from "vasille-router/web-router";

export type {
    theme,
    tablet,
    dark,
    mobile,
    laptop,
    prefersLight,
    prefersDark,
    setMobileMaxWidth,
    setTabletMaxWidth,
    setLaptopMaxWidth,
} from "vasille-css";

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
    coreMount<Node, Element, TagOptions, T>(element, component, new Runner(debugUi ?? false, window.document), $);
}

export function routerApp<Routes extends string>(
    init: WebRouterInitialization<Routes>,
    element?: Element,
    debugUi?: boolean,
) {
    coreRouteApp(element ?? document.body, window, window.location, init, debugUi);
}
