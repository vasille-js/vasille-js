import { App } from "vasille";
import type { TagOptions } from "vasille/web-runner";
import type { StyleProps } from "../spec/css.d.ts";
import type { ScreenProps } from "vasille-router";
import type { Router } from "vasille-router/web-router";

export type { RawStyleProps as StyleProps } from "../spec/css.d.ts";
export type { FallbackScreenProps, ErrorScreenProps } from "vasille-router";

/** Set a handler for component errors */
export declare function setErrorHandler(handler: (e: unknown) => void): void;

declare interface Params {
    slot(...args: unknown[]): unknown;
}

declare type Composed<In extends object, Out> = (
    $: (Required<In> extends Params ? Omit<In, "slot"> & { slot?: unknown } : In) & {
        callback?(data: Out): void;
    },
) => void;
declare type ComposedNoCallback<In extends object, Out> = (
    $: Required<In> extends Params ? Omit<In, "slot"> & { slot?: unknown } : In,
) => void;

/** Composes a component (v3), which can receive external reactive values via props */
export declare function compose<In extends object, Out extends NonNullable<unknown>>(
    renderer: (input: In) => Out,
): Composed<In, Out>;
export declare function compose<In extends object>(renderer: (input: In) => void): ComposedNoCallback<In, void>;

/** Composes a component (v4), which can receive external reactive values via props */
export declare function component<In extends object, Out extends NonNullable<unknown>>(
    renderer: (input: In) => Out,
): Composed<In, Out>;
export declare function component<In extends object>(renderer: (input: In) => void): ComposedNoCallback<In, void>;

/** Composes a view, which can receive external reactive values via props */
export declare function view<Out extends NonNullable<unknown>>(
    renderer: () => Out,
): Composed<NonNullable<unknown>, Out>;
export declare function view<In extends object, Out extends NonNullable<unknown>>(
    renderer: (input: In) => Out,
): Composed<In, Out>;
export declare function view(renderer: () => void): ComposedNoCallback<NonNullable<unknown>, void>;
export declare function view<In extends object>(renderer: (input: In) => void): ComposedNoCallback<In, void>;

/** A Vasille.JS App screen */
type Screen<Route extends string> = (input: ScreenProps<Route>) => Promise<void>;

/** Composes a screen, the router navigates between screens */
export declare function screen<Route extends string>(renderer: Screen<Route>): Screen<Route>;
/** Composes a page, the file-based router navigates between pages (used for tests only) */
export declare function page<Route extends string>(renderer: Screen<Route>): Screen<Route>;

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
export declare function For<T>(props: {
    of: readonly DeepReadonly<T>[];
    slot?: (value: DeepReadonly<T>) => void;
}): void;
export declare function For<T>(props: {
    of: ReadonlySet<DeepReadonly<T>>;
    slot?: (value: DeepReadonly<T>) => void;
}): void;
export declare function For<K, T>(props: {
    of: ReadonlyMap<DeepReadonly<K>, DeepReadonly<T>>;
    slot?: (value: DeepReadonly<T>, index: DeepReadonly<K>) => void;
}): void;

/** Refresh the content each time then the reactive model is updated */
export declare function Watch<T>(props: { $model: T; slot?: (value: T) => void }): void;

/** Create a debug comment in DOM */
export declare function Debug(props: { $model: unknown }): void;

/** Render content after a while */
export declare function Delay(props: { time?: number; slot?: unknown }): void;

export type DeepReadonly<T> =
    T extends Map<infer K, infer V>
        ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
        : T extends ReadonlyMap<infer K, infer V>
          ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
          : T extends WeakMap<infer K, infer V>
            ? WeakMap<DeepReadonly<K>, DeepReadonly<V>>
            : T extends Set<infer U>
              ? ReadonlySet<DeepReadonly<U>>
              : T extends ReadonlySet<infer U>
                ? ReadonlySet<DeepReadonly<U>>
                : T extends WeakSet<infer U>
                  ? WeakSet<DeepReadonly<U>>
                  : T extends Promise<infer U>
                    ? Promise<DeepReadonly<U>>
                    : T extends (...args: unknown[]) => unknown
                      ? T
                      : T extends {}
                        ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
                        : T;

/** Stores a singleton state to memory */
export declare function store<Return extends object>(fn: () => Return): DeepReadonly<Return>;

/** Creates a model (state) constructor */
export declare function model<Return extends object>(fn: () => Return): () => DeepReadonly<Return>;
export declare function model<Input extends object, Return extends object>(
    fn: (input: Input) => Return,
): (input: Input) => DeepReadonly<Return>;

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

/** Run a function before component mount */
export declare function beforeMount(fn: () => void): void;

/** Run a function after component mount */
export declare function afterMount(fn: () => void): void;

/** Run a function before component destroy */
export declare function beforeDestroy(fn: () => void): void;

/** Returns the current used router */
export declare function router(): Router<string> | undefined;

/** Composes a modal window (v4+) */
export declare function modal<T extends object>(modal: (input: T) => void): (input: T) => void;

/** Describes properties of a prompt window */
export interface PromptProps<T> {
    resolve(data: T): void;
    reject(err: unknown): void;
}

/** Composes a function which will show a prompt on call */
export declare function prompt<T, Input extends PromptProps<T> = PromptProps<T>>(
    modal: (input: Input) => void,
): (input: Omit<Input, keyof PromptProps<unknown>>, timeout?: number) => Promise<T>;
