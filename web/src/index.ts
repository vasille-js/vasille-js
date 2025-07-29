import {StyleProps} from "./spec/css.js";
import {Runner, TagOptions} from "vasille/web-runner";
import {mount as coreMount} from "vasille-dx";
import {styleSheet as coreStyleSheet} from "vasille-css";

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

export const styleSheet = coreStyleSheet as <T extends {
  [className: string]: {
    [media: `@${string}`]: {
      [state: `:${string}`]: StyleProps;
    } & StyleProps;
    [state: `:${string}`]: StyleProps;
  } & StyleProps;
}>(input: T) => {[K in keyof T]: string};

export function mount<T> (element: Element, component: ($: T) => void, $: T, debugUi?: boolean) {
  coreMount<Node, Element, TagOptions, T>(element, component, new Runner(debugUi ?? false, window.document), $);
}
