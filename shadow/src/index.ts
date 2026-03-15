import { ClassItem, StyleProps } from "vasille-web";
import { EventHandlers, prefixedObject, TagAttrs, TagEvents, TagProps } from "vasille-web/jsx-runtime";

export {
    context,
    impute,
    receive,
    share,
    expr,
    bind,
    watch,
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
    calculate,
    ref,
    ensure,
    view,
    modal,
    screen,
    page,
    mount,
    prompt,
    safe,
    routerApp,
    setLaptopMaxWidth,
    setMobileMaxWidth,
    setTabletMaxWidth,
    styleSheet,
} from "vasille-web";

export { shadow as compose, shadow as component } from "./lib.js";

type Kebab<T extends string, A extends string = ""> = T extends `${infer F}${infer R}`
    ? Kebab<R, `${A}${F extends Lowercase<F> ? "" : "-"}${Lowercase<F>}`>
    : A;

export type WebComponentAttributes<T extends object> = {
    [K in keyof T as K extends `$${infer R}`
        ? Kebab<R>
        : K extends `on${string}`
          ? never
          : K extends string
            ? Kebab<K>
            : K]?: string extends T[K] ? T[K] : number extends T[K] ? T[K] : boolean extends T[K] ? T[K] : never;
};

export type WebComponentEventHandler<T, Element> = T extends (arg: infer Arg, ...args: unknown[]) => unknown
    ? (ev: CustomEvent<Arg>, element: Element) => void
    : (ev: CustomEvent<never>, element: Element) => void;

export type WebComponentEvents<T extends object, Element> = {
    [K in keyof T as K extends `on${infer R}` ? `on${Kebab<R>}` : never]?: ((...args: unknown[]) => any) extends T[K]
        ? WebComponentEventHandler<T[K], Element>
        : never;
};

export type WebComponentProps<T extends object> = {
    [K in keyof T as K extends `$${infer R}` ? R : K]?: T[K];
};

export type EmptyObject = NonNullable<unknown>;

export type WebComponent<
    T extends (arg: object) => void,
    Props extends object = T extends (arg: infer Arg) => void
        ? Arg extends object
            ? Omit<Arg, "slot" | "callback">
            : EmptyObject
        : EmptyObject,
    Return extends object = T extends (arg: { callback: (arg: infer Arg) => void }) => void
        ? Arg extends object
            ? Arg
            : EmptyObject
        : EmptyObject,
> = {
    class?: ClassItem[] | string;
    style?: StyleProps | string;
    callback?: (element: WebComponentProps<Props> & Return & HTMLElement) => void;
    slot?: unknown;
} & WebComponentEvents<Props, HTMLElement & Return & WebComponentProps<Props>> &
    prefixedObject<EventHandlers<TagEvents<HTMLElement & Return & WebComponentProps<Props>>>, "on"> &
    WebComponentAttributes<Props> &
    Partial<TagAttrs> &
    prefixedObject<WebComponentProps<Props> & TagProps<HTMLElement>, "bind:">;

type EventHandlersAdapter<T, Element> = {
    [K in keyof T]: T[K] extends (arg: infer Arg, ...args: unknown[]) => unknown
        ? (arg: Arg, element: Element) => void
        : (_: never, element: Element) => void;
};

export type WebComponentAdapter<
    Attributes extends object,
    Properties extends object,
    Methods extends object,
    Events extends object,
> = {
    class?: ClassItem[] | string;
    style?: StyleProps | string;
    callback?: (element: HTMLElement & Properties & Methods) => void;
} & Partial<Attributes> &
    Partial<TagAttrs> &
    prefixedObject<Properties, "bind:"> &
    prefixedObject<EventHandlersAdapter<Events, HTMLElement & Properties & Methods>, "on-"> &
    prefixedObject<EventHandlers<TagEvents<HTMLElement & Properties & Methods>>, "on">;
