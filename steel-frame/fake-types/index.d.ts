import { App } from "vasille";
import type { TagOptions } from "vasille/web-runner";
import type { StyleSheetProps as StyleProps } from "vasille-web";
import type { ScreenProps } from "vasille-router";
import type { Router } from "vasille-router/web-router";

export type { StyleProps } from "vasille-web";
export type ClassItem = string | Record<string, boolean> | false;
export type { FallbackScreenProps, ErrorScreenProps } from "vasille-router";
export { safe } from "vasille";
export type { AppSide, IdeSide } from "../types/communication.d.ts";

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
export declare function For<T>(props: { of: ReadonlyArray<T>; slot?: (value: T) => void }): void;
export declare function For<T>(props: { of: ReadonlySet<T>; slot?: (value: T) => void }): void;
export declare function For<K, T>(props: { of: ReadonlyMap<K, T>; slot?: (value: T, index: K) => void }): void;

/** Refresh the content each time then the reactive model is updated */
export declare function Watch<T>(props: { $model: T; slot?: (value: T) => void }): void;

/** Create a debug comment in DOM */
export declare function Debug(props: { $model: unknown }): void;

/** Render content after a while */
export declare function Delay(props: { time?: number; slot?: unknown }): void;

type ReadonlyState<T> =
    T extends Map<infer K, infer V>
        ? ReadonlyMap<K, V>
        : T extends Set<infer V>
          ? ReadonlySet<V>
          : T extends Array<infer V>
            ? ReadonlyArray<V>
            : T extends object
              ? { readonly [K in keyof T]: T[K] }
              : T;

/** Stores a singleton state to memory */
export declare function store<Return extends object>(fn: () => Return): ReadonlyState<Return>;

/** Creates a model (state) constructor */
export declare function model<Return extends object>(fn: () => Return): () => ReadonlyState<Return>;
export declare function model<Input extends object, Return extends object>(
    fn: (input: Input) => Return,
): (input: Input) => ReadonlyState<Return>;

export { QueryParams, ScreenProps, RouteParameters } from "vasille-router";
export { type Router, NavigationMode } from "vasille-router/web-router";

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
export declare function mount<T>(element: Element, component: ($: T) => void, $: T): App<Node, Element, TagOptions>;

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
): App<Node, Element, TagOptions>;

/** Run a function before component mount */
export declare function beforeMount(fn: () => void): void;
export declare function beforeMount(fn: () => Promise<void>): void;

/** Run a function after component mount */
export declare function afterMount(fn: () => void): void;
export declare function afterMount(fn: () => Promise<void>): void;

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

/** Describes an injectable context value */
export declare class SteelContext<Args extends unknown[], Value> {
    private fn: (...args: Args) => Value;
}

/** Create an injectable context */
export declare function context<Value, Args extends unknown[] = never[]>(fn: (...args: Args) => Value): SteelContext<Args, Value>;

/** Share an context to children components */
export declare function share<Args extends unknown[], Value>(ctx: SteelContext<Args, Value>, ...args: Args): Value;

/** Share a dependency */
export declare function share<Class>(className: new (...args: unknown[]) => Class, value: Class): Class;

/** Share a settings */
export declare function share(key: string, value: string): string;

/** Receive an shared context */
export declare function receive<Args extends unknown[], Value>(ctx: SteelContext<Args, Value>): Value;

/** Receive a dependency */
export declare function receive<Class>(className: new (...args: unknown[]) => Class): Class;

/** Receive a settings */
export declare function receive(key: string): string;

/** Create and share an context when it is missing */
export declare function impute<Args extends unknown[], Value>(ctx: SteelContext<Args, Value>, ...args: Args): Value;

/** Ensure a dependency presence in context */
export declare function impute<Class>(className: new (...args: unknown[]) => Class, value: () => Class): Class;

/** Share a setting value when it is missing */
export declare function impute(key: string, value: string): string;
