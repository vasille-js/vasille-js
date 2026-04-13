import { Reactive } from "vasille";

const searchMap = new Map<Reactive, Map<unknown, unknown>>();

function lookUp(node: Reactive, key: unknown): unknown {
  let it: Reactive|null = node;

  while (it) {
    const value = searchMap.get(it)?.get(key);

    if (value !== undefined) {
      return value;
    }

    it = "parent" in it ? it.parent as Reactive : null;
  }
}

function setUp(node: Reactive, key: unknown, value: unknown) {
  let map = searchMap.get(node);

  if (!map) {
    const created = (map = new Map());
    searchMap.set(node, created);
    node.runOnDestroy(() => created.delete(node));
  }

  map.set(key, value);

  return value;
}

export class SteelContext<Args extends unknown[], Value> {
  public readonly fn: (...args: Args) => Value;

  public constructor(fn: (...args: Args) => Value) {
    this.fn = fn;
  }
}

export function context<Value, Args extends unknown[] = never[]>(
  fn: (...args: Args) => Value,
): SteelContext<Args, Value> {
  return new SteelContext(fn);
}

export function share<Args extends unknown[], Value>(
  node: Reactive,
  ctx: SteelContext<Args, Value>,
  ...args: Args
): Value;
export function share<Class>(
  node: Reactive,
  className: abstract new (...args: unknown[]) => Class,
  value: Class,
): Class;
export function share(node: Reactive, key: string, value: string): string;
export function share(
  node: Reactive,
  target:
    | SteelContext<unknown[], unknown>
    | (abstract new (...args: unknown[]) => unknown)
    | string,
  ...args: unknown[]
): unknown {
  if (target instanceof SteelContext) {
    return setUp(node, target, target.fn(...args));
  }
  return setUp(node, target, args[0]);
}

export function receive<Args extends unknown[], Value>(
  node: Reactive,
  ctx: SteelContext<Args, Value>,
): Value;
export function receive<Class>(
  node: Reactive,
  className: abstract new (...args: unknown[]) => Class,
): Class;
export function receive(node: Reactive, key: string): string;
export function receive(node: Reactive, key: unknown): unknown {
  const value = lookUp(node, key);

  if (value === undefined) {
    throw new Error(`Missing value for key "${key}"`);
  }

  return value;
}

export function receiveOptional<Args extends unknown[], Value>(
    node: Reactive,
    ctx: SteelContext<Args, Value>,
): Value|undefined;
export function receiveOptional<Class>(
    node: Reactive,
    className: abstract new (...args: unknown[]) => Class,
): Class|undefined;
export function receiveOptional(node: Reactive, key: string): string|undefined;
export function receiveOptional(node: Reactive, key: unknown): unknown {
  return lookUp(node, key);
}

export function impute<Args extends unknown[], Value>(
  node: Reactive,
  ctx: SteelContext<Args, Value>,
  ...args: Args
): Value;
export function impute<Class>(
  node: Reactive,
  className: abstract new (...args: unknown[]) => Class,
  value: () => Class,
): Class;
export function impute(node: Reactive, key: string, value: string): string;
export function impute(node: Reactive, target: unknown, ...args: unknown[]) {
  if (target instanceof SteelContext || typeof target === "string") {
    // @ts-expect-error
    return lookUp(node, target) ?? share(node, target, ...args);
  }

  // @ts-expect-error
  return lookUp(node, target) ?? share(node, target, args[0]());
}
