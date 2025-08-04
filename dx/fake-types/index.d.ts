import type { Runner, App } from "vasille";



declare interface Params {
  slot?(...args: unknown[]): unknown;
}

declare type Composed<In extends Params, Out> = (
  $: (In['slot'] extends (() => unknown) | undefined ? Omit<In, 'slot'>& {slot?: unknown} : (In))
      & { callback?(data: Out | undefined): void },
  slot?: In['slot'],
) => void;

declare function compose<In extends Params, Out>(
  renderer: (input: In) => Out
): Composed<In, Out>;
declare function compose<In, Out>(
  renderer: (input: In) => Out
): Composed<In, Out>;

declare function mount<Node, Element, TagOptions extends object, T>(
    tag: Element, component: ($: T) => unknown, runner: Runner<Node, Element, TagOptions>, $: T
): App<Node, Element, TagOptions>;

declare function value<T>(v: T): T;
declare function ref<T>(v: T): T;
declare function bind<T>(v: T): T;
declare function calculate<T>(fn: () => T): T;
declare function arrayModel<T>(v?: T[]) : T[] & { destroy(): void };
declare function setModel<T>(v?: T[]): Set<T> & { destroy(): void };
declare function mapModel<K, T>(v?: [K, T][]): Map<K, T> & { destroy(): void };
declare function reactiveObject<T extends object>(o: T): T;

declare function Slot<Args extends never[]|[object]>(
    options: {
        model?: ((...args: Args) => void);
        slot?: () => void;
    } & (Args extends never[] ? {} : Args[0]),
): void;

declare function If(
  props: { condition: unknown; slot?: unknown }
): void;

declare function ElseIf(
  props: { condition: unknown; slot?: unknown },
): void;

declare function Else(
  props: { slot?: unknown }
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

declare function Delay(
  props: { time?: number; slot?: unknown }
): void;

declare function forward<T>(value: T): T;

declare function calculate<T>(f: () => T): T;

declare function watch(f: () => void): void;

declare function awaited<T>(target: Promise<T>): [unknown, T|undefined];
declare function awaited<T>(target: () => Promise<T>): [unknown, T|undefined, () => void];

declare function store<Return extends object>(fn: () => Return): (() => Return);
declare function store<Input extends object, Return extends object>(
    fn: (input: Input) => Return
): (input: Input) => Return;
