import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal } from "./internal.js";

export type FnNames =
  | "compose"
  | "view"
  | "component"
  | "store"
  | "model"
  | "page"
  | "modal"
  | "prompt"
  | "awaited"
  | "calculate"
  | "forward"
  | "backward"
  | "watch"
  | "ref"
  | "bind"
  | "raw"
  | "arrayModel"
  | "setModel"
  | "mapModel"
  | "beforeMount"
  | "afterMount"
  | "beforeDestroy"
  | "router"
  | "theme"
  | "dark"
  | "mobile"
  | "tablet"
  | "laptop"
  | "prefersDark"
  | "prefersLight"
  | "styleSheet";

export const composeFunctions = [
  "compose",
  "store",
  "model",
  "view",
  "component",
  "page",
  "modal",
  "prompt",
] as const satisfies FnNames[];

export const reactivityFunctions = ["ref", "awaited", "backward"] as const satisfies FnNames[];

export const bindFunctions = ["forward", "watch", "calculate", "bind"] as const satisfies FnNames[];

export const modelFunctions = ["arrayModel", "mapModel", "setModel"] as const satisfies FnNames[];

export const composeOnly = ["router", "beforeMount", "afterMount", "beforeDestroy"] as const satisfies FnNames[];
export const styleOnly = [
  "theme",
  "dark",
  "mobile",
  "tablet",
  "laptop",
  "prefersDark",
  "prefersLight",
  "styleSheet",
] as const satisfies FnNames[];

export const hintFunctions: FnNames[] = [
  ...reactivityFunctions,
  ...composeFunctions,
  ...bindFunctions,
  ...modelFunctions,
  ...composeOnly,
  ...styleOnly,
];

function checkCall<T extends string>(name: T, internal: Internal): T {
  if (name === "store") {
    internal.stateOnly = true;
  }
  if (["compose", "view", "screen"].includes(name)) {
    internal.stateOnly = false;
  }

  return name;
}

export function calls(path: NodePath<types.CallExpression>, names: FnNames[], internal: Internal): boolean;
export function calls(
  path: NodePath<types.Expression | null | undefined>,
  names: FnNames[],
  internal: Internal,
): path is NodePath<types.CallExpression>;
export function calls(
  path: NodePath<types.Expression | null | undefined>,
  names: FnNames[],
  internal: Internal,
): path is NodePath<types.CallExpression> {
  const node = path.node;
  const set = new Set<string>(names);
  const callee = t.isCallExpression(node) ? node.callee : null;

  if (callee) {
    if (t.isIdentifier(callee)) {
      const mapped = internal.mapping.get(callee.name);

      if (mapped && set.has(mapped) && internal.stack.get(callee.name) === undefined) {
        return !!checkCall(mapped, internal);
      }
      return false;
    }

    let propName: string | null = null;

    if (t.isMemberExpression(callee)) {
      /* istanbul ignore else */
      if (t.isIdentifier(callee.property)) {
        propName = callee.property.name;
      } else if (t.isStringLiteral(callee.property)) {
        propName = callee.property.value;
      }
    }

    if (
      propName &&
      set.has(propName) &&
      t.isMemberExpression(callee) &&
      t.isIdentifier(callee.object) &&
      callee.object.name === internal.global &&
      internal.stack.get(internal.global) === undefined
    ) {
      return !!checkCall(propName, internal);
    }
  }

  return false;
}
