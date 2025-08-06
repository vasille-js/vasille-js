import type { Runner, App } from "vasille";


declare interface Params {
    slot?(...args: unknown[]): unknown;
}

declare type Composed<In extends Params, Out> = (
  $: (In['slot'] extends (() => unknown) | undefined ? Omit<In, 'slot'>& {slot?: unknown} : (In))
      & { callback?(data: Out | undefined): void },
  slot?: In['slot'],
) => void;
declare type ComposedNoCallback<In extends Params, Out> = (
    $: (In['slot'] extends (() => unknown) | undefined ? Omit<In, 'slot'> & {slot?: unknown} : (In)),
    slot?: In['slot'],
) => void;

/**
 * create an MVVM view, which can receive external reactive value as props
 * @param renderer is the view constructor
 */
declare function mvvmView(
    renderer: () => void
): ComposedNoCallback<NonNullable<unknown>, void>;
declare function mvvmView<In extends object>(
  renderer: (input: In) => void
): ComposedNoCallback<In, void>;
declare function mvvmView<Out>(
    renderer: (input: NonNullable<unknown>) => Out
): Composed<NonNullable<unknown>, Out>;
declare function mvvmView<In extends object, Out>(
  renderer: (input: In) => Out
): Composed<In, Out>;

/**
 * create an MVC view, which can receive models from the parent component
 * @param renderer is the view constructor
 */
declare function mvcView<In extends object>(
    renderer: (input: In) => void
): ComposedNoCallback<In, void>;
declare function mvcView<In extends object, Out>(
    renderer: (input: In) => Out
): Composed<In, Out>;

/**
 * create a hybrid view, which can receive external models and reactive values
 * @param renderer is the view constructor
 */
declare function hybridView<Models extends object, Props extends object>(
    renderer: (models: Models, props: Props) => void
): ComposedNoCallback<Models & Props, void>;
declare function hybridView<Models extends object, Props extends object, Out>(
    renderer: (models: Models, props: Props) => Out
): Composed<Models & Props, Out>;

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
