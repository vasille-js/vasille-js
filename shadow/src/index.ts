import { ClassItem, StyleProps } from "vasille-web";

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

export type Attributes<T extends object> = {
    [K in keyof T as K extends `$${infer R}` ? Kebab<R> : K extends string ? Kebab<K> : K]?: string extends T[K]
        ? T[K]
        : number extends T[K]
          ? T[K]
          : boolean extends T[K]
            ? T[K]
            : never;
};

export type Props<T extends object> = {
    [K in keyof T as K extends `$${infer R}` ? R : K]: T[K];
};

type prefixedObject<T, P extends string> = {
    [K in keyof T as K extends string ? `${P}${K}` : never]?: T[K];
};

export type WebComponent<T extends object> = {
    class?: ClassItem[] | string;
    style?: StyleProps | string;
} & Attributes<T> &
    prefixedObject<Props<T>, "bind:">;
