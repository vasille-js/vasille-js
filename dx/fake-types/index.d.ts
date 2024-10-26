import { Fragment, IValue } from "vasille";

declare interface CompositionProps {
  slot?: (...args: any[]) => void;
}


declare type Composed<In extends CompositionProps, Out> = (
  this: Fragment,
  $: In & { callback?(data: Out | undefined): void },
  slot?: In["slot"],
) => void;

declare function compose<In extends CompositionProps, Out>(
  renderer: (input: In) => Out
): Composed<In, Out>;

declare function extend<In extends CompositionProps, Out>(
  renderer: (input: In) => Out
): Composed<In, Out>;

declare function mount<T>(
  tag: Element, component: ($: T) => unknown, $: T
): void;

declare function Adapter(
  props: { node: Fragment; slot?: () => void }
): void;

declare function Slot<T extends object = {}>(
  options: {
      model?: (() => void) | ((input: T) => void);
      slot?: () => void;
  } & T,
): void;

declare function If(
  props: { condition: unknown; slot?: () => void }
): void;

declare function ElseIf(
  props: { condition: unknown; slot?: () => void },
): void;

declare function Else(
  props: { slot?: () => void }
): void;

declare function For<T>(
  props: { of: T[]; slot?: (value: T) => void }
): void;
declare function For<T>(
  props: { of: Set<T>; slot?: (value: T) => void }
): void;
declare function For<K, T>(
  props: { of: Map<K, T>; slot?: (value: T, index: K) => void }
): void;

declare function Watch<T>(
  props: { model: T; slot?: (value: T) => void }
): void;

declare function Debug(
  props: { model: unknown }
): void;

declare function Mount(
  mount: { bind: unknown }
): void;

declare function Show(
  props: { bind: unknown }
): void;

declare function Delay(
  props: { time?: number; slot?: () => {} }
): void;

declare function forward<T>(value: T): T;

declare function point<T>(value: T): T;

declare function calculate<T>(f: () => T): T;

declare function watch(f: () => void): void;

declare function awaited<T>(target: Promise<T>): [unknown, T|undefined];

declare function ensureIValue<T>(value: T): IValue<T>;
