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

/** Composes a component (v3), which can receive external reactive values via props */
export declare function compose<In extends object>(renderer: (input: In) => void): ComposedNoCallback<In, void>;
export declare function compose<In extends object, Out>(renderer: (input: In) => Out): Composed<In, Out>;

/** Composes a component (v4), which can receive external reactive values via props */
export declare function component<In extends object>(renderer: (input: In) => void): ComposedNoCallback<In, void>;
export declare function component<In extends object, Out>(renderer: (input: In) => Out): Composed<In, Out>;

/** Composes a view, which can receive external reactive values via props */
export declare function view(renderer: () => void): ComposedNoCallback<NonNullable<unknown>, void>;
export declare function view<In extends object>(renderer: (input: In) => void): ComposedNoCallback<In, void>;
export declare function view<Out>(renderer: (input: NonNullable<unknown>) => Out): Composed<NonNullable<unknown>, Out>;
export declare function view<In extends object, Out>(renderer: (input: In) => Out): Composed<In, Out>;

/** A Vasille.JS App screen */
type Screen<Route extends string> = (input: ScreenProps<Route>) => Promise<void>;

/** Composes a screen, the router navigates between screens */
export declare function screen<Route extends string>(renderer: Screen<Route>): Screen<Route>;

/** Returns the raw value of expression */
export declare function raw<T>(v: T): T;
/** Returns a reactive value of expression */
export declare function ref<T>(v: T): T;
/** Returns a reactive-computed form of expression */
export declare function bind<T>(v: T): T;
/** Returns a reactive-computed form of returned value */
export declare function calculate<T>(fn: () => T): T;
/** Runs the function each time when a dependency is changed */
export declare function watch(f: () => void): void;
/** Returns a view-model bind, which send data only forward */
export declare function forward<T>(v: T): T;
/** Returns a view-model bind, which send data only backward */
export declare function backward<T>(v: T): T;
/** Returns an array model of the array */
export declare function arrayModel<T>(v?: T[]): T[];
/** Returns a set model of array values */
export declare function setModel<T>(v?: T[]): Set<T>;
/** Returns a map model of map data */
export declare function mapModel<K, T>(v?: [K, T][]): Map<K, T>;

/** Awaits async data in a sync component */
export declare function awaited<T>(target: Promise<T>): [unknown, T | undefined, () => void];
export declare function awaited<T>(target: () => Promise<T>): [unknown, T | undefined, () => void];

/** Mounts a slot parameter of the component */
export declare function Slot(options: { model?: () => void; slot?: () => void }): void;
export declare function Slot<Props extends object>(
    options: {
        model?: (props: Props) => void;
        slot?: () => void;
    } & Props,
): void;

/** Renders content conditionally */
export declare function If(props: { $condition: unknown; slot?: unknown }): void;

/** Renders content conditionally, use strict after `<If/>` */
export declare function ElseIf(props: { $condition: unknown; slot?: unknown }): void;

/** Renders content conditionally, use strict after `<If/>` or `<ElseIf/>` */
export declare function Else(props: { slot?: unknown }): void;

/** Renders content several times using a model (array, map or set) */
export declare function For<T>(props: { of: T[]; slot?: (value: T) => void }): void;
export declare function For<T>(props: { of: Set<T>; slot?: (value: T) => void }): void;
export declare function For<K, T>(props: { of: Map<K, T>; slot?: (value: T, index: K) => void }): void;

/** Refresh the content each time then the reactive model is updated */
export declare function Watch<T>(props: { $model: T; slot?: (value: T) => void }): void;

/** Create a debug comment in DOM */
export declare function Debug(props: { $model: unknown }): void;

/** Render content after a while */
export declare function Delay(props: { time?: number; slot?: unknown }): void;

/** Stores a state to memory */
export declare function store<Return extends object>(fn: () => Return): Return;
export declare function store<Input extends object, Return extends object>(fn: (input: Input) => Return): Return;

export { $ } from "vasille-jsx";

export { QueryParams, ScreenProps, RouteParameters } from "vasille-router";
export { Router, NavigationMode } from "vasille-router/web-router";

/** Applies the value to theme `name` */
export declare function theme<T>(name: string, value: T): T;
/** Applies the value to dark theme */
export declare function dark<T>($: T): T;
/** Applies the value to mobile devices */
export declare function mobile<T>($: T): T;
/** Applies the value to tablet devices */
export declare function tablet<T>($: T): T;
/** Applies the value to laptop devices */
export declare function laptop<T>($: T): T;
/** Applies the value when user prefers dark theme */
export declare function prefersDark<T>($: T): T;
/** Applies the value when user prefers light theme */
export declare function prefersLight<T>($: T): T;

export { setMobileMaxWidth, setTabletMaxWidth, setLaptopMaxWidth } from "vasille-css";

/** Creates a local style sheet */
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

/** Mounts a Vasille.JS component to page */
export declare function mount<T>(
    element: Element,
    component: ($: T) => void,
    $: T,
    debugUi?: boolean,
): App<Node, Element, TagOptions>;

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

/** Starts a route app */
export declare function routerApp<Routes extends string>(
    init: RouterInitialization<Routes>,
    element?: Element,
    debugUi?: boolean,
): App<Node, Element, TagOptions>;

/** Run a function before component destroy */
export declare function runOnDestroy(fn: () => void): void;

/** Returns the current used router */
export declare function router(): Router<string> | undefined;
