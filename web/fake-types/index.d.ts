import { ArrayModel, SetModel, MapModel, IValue, App, Fragment } from "vasille";
import type { TagOptions } from "vasille/web-runner";
import type { StyleProps } from "../spec/css.d.ts";
import type { ScreenProps } from "vasille-router";
import type { Router } from "vasille-router/web-router";

declare interface Params {
    slot?(...args: unknown[]): unknown;
}

declare type Composed<In extends Params, Out> = (
    $: (In["slot"] extends (() => unknown) | undefined ? Omit<In, "slot"> & { slot?: unknown } : In) & {
        callback?(data: Out | undefined): void;
    },
    slot?: In["slot"],
) => void;
declare type ComposedNoCallback<In extends Params, Out> = (
    $: In["slot"] extends (() => unknown) | undefined ? Omit<In, "slot"> & { slot?: unknown } : In,
    slot?: In["slot"],
) => void;

/**
 * create an MVVM view, which can receive external reactive value as props
 * @param renderer is the view constructor
 */
export declare function compose<In extends object>(renderer: (input: In) => void): ComposedNoCallback<In, void>;
export declare function compose<In extends object, Out>(renderer: (input: In) => Out): Composed<In, Out>;

/**
 * create an MVVM view, which can receive external reactive value as props
 * @param renderer is the view constructor
 */
export declare function view(renderer: () => void): ComposedNoCallback<NonNullable<unknown>, void>;
export declare function view<In extends object>(renderer: (input: In) => void): ComposedNoCallback<In, void>;
export declare function view<Out>(renderer: (input: NonNullable<unknown>) => Out): Composed<NonNullable<unknown>, Out>;
export declare function view<In extends object, Out>(renderer: (input: In) => Out): Composed<In, Out>;

/**
 * create an MVVM view, which can receive external reactive value as props
 * @param renderer is the view constructor
 */
export declare function mvvmView(renderer: () => void): ComposedNoCallback<NonNullable<unknown>, void>;
export declare function mvvmView<In extends object>(renderer: (input: In) => void): ComposedNoCallback<In, void>;
export declare function mvvmView<Out>(
    renderer: (input: NonNullable<unknown>) => Out,
): Composed<NonNullable<unknown>, Out>;
export declare function mvvmView<In extends object, Out>(renderer: (input: In) => Out): Composed<In, Out>;

/**
 * create an MVC view, which can receive models from the parent component
 * @param renderer is the view constructor
 */
export declare function mvcView<In extends object>(renderer: (input: In) => void): ComposedNoCallback<In, void>;
export declare function mvcView<In extends object, Out>(renderer: (input: In) => Out): Composed<In, Out>;

/**
 * create a hybrid view, which can receive external models and reactive values
 * @param renderer is the view constructor
 */
export declare function hybridView<Models extends object, Props extends object>(
    renderer: (models: Models, props: Props) => void,
): ComposedNoCallback<Models & Props, void>;
export declare function hybridView<Models extends object, Props extends object, Out>(
    renderer: (models: Models, props: Props) => Out,
): Composed<Models & Props, Out>;

export declare function value<T>(v: T): T;
export declare function ref<T>(v: T): T;
export declare function bind<T>(v: T): T;
export declare function calculate<T>(fn: () => T): T;
export declare function arrayModel<T>(v?: T[]): T[] & { destroy(): void };
export declare function setModel<T>(v?: T[]): Set<T> & { destroy(): void };
export declare function mapModel<K, T>(v?: [K, T][]): Map<K, T> & { destroy(): void };
export declare function reactiveObject<T extends object>(o: T): T;

export declare function Slot(options: { model?: () => void; slot?: () => void }): void;
export declare function Slot<Props extends object>(
    options: {
        model?: (props: Props) => void;
        slot?: () => void;
    } & Props,
): void;

export declare function If(props: { condition: unknown; slot?: unknown }): void;

export declare function ElseIf(props: { condition: unknown; slot?: unknown }): void;

export declare function Else(props: { slot?: unknown }): void;

export declare function For<T>(props: { of: T[]; slot?: (value: T) => void }): void;
export declare function For<T>(props: { of: Set<T>; slot?: (value: T) => void }): void;
export declare function For<K, T>(props: { of: Map<K, T>; slot?: (value: T, index: K) => void }): void;

export declare function Watch<T>(props: { model: T; slot?: (value: T) => void }): void;

export declare function Debug(props: { model: unknown }): void;

export declare function Delay(props: { time?: number; slot?: unknown }): void;

export declare function forward<T>(value: T): T;

export declare function calculate<T>(f: () => T): T;

export declare function watch(f: () => void): void;

export declare function awaited<T>(target: Promise<T>): [unknown, T | undefined];
export declare function awaited<T>(target: () => Promise<T>): [unknown, T | undefined, () => void];

export declare function store<Return extends object>(fn: () => Return): () => Return;
export declare function store<Input extends object, Return extends object>(
    fn: (input: Input) => Return,
): (input: Input) => Return;

export { $ } from "vasille-jsx";

export { QueryParams, ScreenProps, RouteParameters } from "vasille-router";
export { Router, NavigationMode } from "vasille-router/web-router";

export declare function theme<T>(name: string, value: T): T;
export declare function dark<T>($: T): T;
// rules with target
export declare function mobile<T>($: T): T;
export declare function tablet<T>($: T): T;
export declare function laptop<T>($: T): T;
export declare function prefersDark<T>($: T): T;
export declare function prefersLight<T>($: T): T;

export { setMobileMaxWidth, setTabletMaxWidth, setLaptopMaxWidth } from "vasille-css";

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

export declare function mount<T>(
    element: Element,
    component: ($: T) => void,
    $: T,
    debugUi?: boolean,
): App<Node, Element, TagOptions>;

type Screen<Route extends string> = (input: ScreenProps<Route>) => Promise<void>;

export declare function screen<Route extends string>(renderer: Screen<Route>): Screen<Route>;

interface RouterInitialization<Routes extends string> {
    routes: {
        [K in Routes]: {
            screen: Screen<K>;
            minAccessLevel?: number;
        };
    };
    getAccessLevel?(): Promise<number>;
    fallbackScreen?(arg: { cause: "not-found" | "no-access" }): void;
    errorScreen?(data: { error: unknown }): void;
    loadingScreen?(props: object): void;
    loadingOverlay?(props: object): void;
}

export declare function routerApp<Routes extends string>(
    init: RouterInitialization<Routes>,
    element?: Element,
    debugUi?: boolean,
): App<Node, Element, TagOptions>;

export declare function runOnDestroy(fn: () => void): void;

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
