import type { StyleProps } from "../src/spec/css.d.ts";

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
    state,
} from "vasille-dx";

export {
    compose,
    Debug,
    Delay,
    Else,
    ElseIf,
    For,
    If,
    Slot,
    Watch,
    awaited,
} from "vasille-dx";

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

export declare const styleSheet: <T extends {
    [className: string]: {
        [media: `@${string}`]: {
            [state: `:${string}`]: StyleProps;
        } & StyleProps;
        [state: `:${string}`]: StyleProps;
    } & StyleProps;
}>(input: T) => { [K in keyof T]: string; };
export declare function mount<T>(element: Element, component: ($: T) => void, $: T, debugUi?: boolean): void;

