import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, ctx } from "./internal.js";

export type FnNames =
  | "compose"
  | "view"
  | "mvvmView"
  | "mvcView"
  | "hybridView"
  | "store"
  | "awaited"
  | "calculate"
  | "forward"
  | "watch"
  | "ref"
  | "bind"
  | "value"
  | "arrayModel"
  | "setModel"
  | "mapModel"
  | "reactiveObject"
  | "runOnDestroy"
  | "router"
  | "theme"
  | "dark"
  | "mobile"
  | "tablet"
  | "laptop"
  | "prefersDark"
  | "prefersLight"
  | "styleSheet";

export const composeOnly: FnNames[] = [
  "forward",
  "watch",
  "calculate",
  "ref",
  "bind",
  "value",
  "awaited",
  "arrayModel",
  "mapModel",
  "setModel",
  "reactiveObject",
  "router",
  "runOnDestroy",
];
export const styleOnly: FnNames[] = [
  "theme",
  "dark",
  "mobile",
  "tablet",
  "laptop",
  "prefersDark",
  "prefersLight",
  "styleSheet",
];
export const requiresContext: FnNames[] = ["awaited"];
const requiresContextSet: Set<string> = new Set(requiresContext);

function checkCall<T extends string>(
  path: NodePath<types.Expression | null | undefined>,
  name: T,
  internal: Internal,
): T {
  const node = path.node;

  if (requiresContextSet.has(name) && t.isCallExpression(node)) {
    if (internal.stateOnly) {
      throw path.buildCodeFrameError(`Vasille: ${name} function can be used only in components`);
    }
    node.arguments.unshift(ctx);
  }
  if (name === "store") {
    internal.stateOnly = true;
  }
  if (["compose", "view", "mvcView", "mvvmView", "hybridView"].includes(name)) {
    internal.stateOnly = false;
  }

  return name;
}

export function calls<T extends FnNames>(
  path: NodePath<types.Expression | null | undefined>,
  names: T[],
  internal: Internal,
): T | false {
  const node = path.node;
  const set = new Set<string>(names);
  const callee = t.isCallExpression(node) ? node.callee : null;

  if (callee) {
    if (t.isIdentifier(callee)) {
      const mapped = internal.mapping.get(callee.name);

      if (mapped && set.has(mapped) && internal.stack.get(callee.name) === undefined) {
        return checkCall(path, mapped, internal) as T;
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
      return checkCall(path, propName, internal) as T;
    }
  }

  return false;
}
