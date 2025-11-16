import {
    devArrayModel,
    devAwaited,
    DevDelay,
    devEnsure,
    devExpr,
    DevFor,
    devMapModel,
    devMatch,
    devModel,
    devRef,
    devSet,
    devSetModel,
    DevSlot,
    devStore,
    DevSwitch,
    devView,
    DevWatch,
} from "vasille-jsx/dev";
import { WebRouterInitialization } from "vasille-web";
import { devModal, devPrompt, devRouterApp, devMount } from "vasille-web/dev";
import { App } from "vasille";
import { TagOptions } from "vasille/web-runner";
import { devScreen } from "vasille-router/dev";
import { Inspector } from "./inspector.js";

export { executionPosition, registerDevValue, shareStateById, positionedText } from "vasille/dev";

export {
    type QueryParams,
    type ScreenProps,
    type RouteParameters,
    type FallbackScreenProps,
    type ErrorScreenProps,
    type WebRouterInitialization,
    type NavigationMode,
    type Router,
    setErrorHandler,
    setLaptopMaxWidth,
    setTabletMaxWidth,
    setMobileMaxWidth,
} from "vasille-web";

export const view = devView;
export const component = devView;
export const compose = devView;
export const ensure = devEnsure;
export const ref = devRef;
export const expr = devExpr;
export const bind = devExpr;
export const calculate = devExpr;
export const watch = devExpr;
export const set = devSet;
export const Delay = DevDelay;
export const For = DevFor;
export const Slot = DevSlot;
export const Watch = DevWatch;
export const awaited = devAwaited;
export const store = devStore;
export const model = devModel;
export const setModel = devSetModel;
export const mapModel = devMapModel;
export const arrayModel = devArrayModel;
export const Switch = DevSwitch;
export const match = devMatch;

export const screen = devScreen;
export const page = devScreen;

export const modal = devModal;
export const prompt = devPrompt;

export function mount<T>(element: Element, component: ($: T) => void, input: T): App<Node, Element, TagOptions> {
    return devMount<T>(element, component, input, new Inspector());
}

export function routerApp<Routes extends string>(
    init: WebRouterInitialization<Routes>,
    element?: Element,
): App<Node, Element, TagOptions> {
    return devRouterApp(init, element ?? document.body, new Inspector());
}
