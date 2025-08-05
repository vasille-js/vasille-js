import type { ArrayModel, SetModel, MapModel, IValue, App } from "vasille";
import {TagOptions} from "vasille/web-runner";
import type { StyleProps } from "../spec/css.d.ts";
import type { Router, WebRouterInitialization } from "vasille-router/web-router";

export {
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

export { compose, Debug, Delay, Else, ElseIf, For, If, Slot, Watch, awaited, store } from "vasille-dx";
export { $ } from "vasille-jsx";

export { QueryParams, ScreenProps, RouteParameters } from "vasille-router";
export { Router, WebRouterInitialization, NavigationMode } from "vasille-router/web-router";

export {
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

export declare const styleSheet: <
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

export declare function mount<T>(element: Element, component: ($: T) => void, $: T, debugUi?: boolean): App<Node, Element, TagOptions>;

export declare function routerApp<Routes extends string>(init: WebRouterInitialization<Routes>, element?: Element, debugUi?: boolean): void;

declare const VasilleKey: unique symbol;

export interface BridgeValue<T> {
    [VasilleKey]: T;
}

export declare const bridge: {
    ref<T>(v: T): BridgeValue<T>;
    bind<T>(v: T): BridgeValue<T>;
    calculate<T>(fn: () => T): BridgeValue<T>;
    watch(fn: () => void): void;
    arrayModel<T>(arr?: T[]): ArrayModel<T>;
    setModel<T>(data?: T[]): SetModel<T>;
    mapModel<K, T>(data?: [K, T][]): MapModel<K, T>;
    reactiveObject<T extends object>(obj: T): { [K in keyof T]: BridgeValue<T[K]> };
    value<T>(of: BridgeValue<T>): T;
    setValue<T>(of: BridgeValue<T>, value: T): T;
    stored<T>(v: T | IValue<T> | BridgeValue<T>): T;
    destroy(v: BridgeValue<unknown>): void;
};

export declare function router(): Router<string> | undefined;
