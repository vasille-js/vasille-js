import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, ctx } from "./internal.js";

export type FnNames =
  | "compose"
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

function checkCall(path: NodePath<types.Expression | null | undefined>, name: string, internal: Internal) {
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
  if (name === "compose") {
    internal.stateOnly = false;
  }

  return name;
}

export function calls(path: NodePath<types.Expression | null | undefined>, names: FnNames[], internal: Internal) {
  const node = path.node;
  const set = new Set<string>(names);
  const callee = t.isCallExpression(node) ? node.callee : null;

  if (callee) {
    if (t.isIdentifier(callee)) {
      const mapped = internal.mapping.get(callee.name);

      if (mapped && set.has(mapped) && internal.stack.get(callee.name) === undefined) {
        return checkCall(path, mapped, internal);
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
      return checkCall(path, propName, internal);
    }
  }

  return false;
}
