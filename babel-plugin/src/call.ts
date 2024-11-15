import { types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, ctx } from "./internal";

export type FnNames =
  | "compose"
  | "extend"
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
  | "theme"
  | "dark"
  | "mobile"
  | "tablet"
  | "laptop"
  | "prefersDark"
  | "prefersLight"
  | "webStyleSheet";

export const composeOnly: FnNames[] = [
  "forward",
  "watch",
  "ref",
  "bind",
  "value",
  "arrayModel",
  "mapModel",
  "setModel",
  "reactiveObject",
];
export const styleOnly: FnNames[] = [
  "theme",
  "dark",
  "mobile",
  "tablet",
  "laptop",
  "prefersDark",
  "prefersLight",
  "webStyleSheet",
];
export const requiresContext: FnNames[] = ["awaited", "forward"];
const requiresContextSet: Set<string> = new Set(requiresContext);

export function calls(node: types.Expression | null | undefined, names: FnNames[], internal: Internal) {
  const set = new Set<string>(names);
  const callee = t.isCallExpression(node) ? node.callee : null;

  if (callee) {
    if (t.isIdentifier(callee)) {
      const mapped = internal.mapping.get(callee.name);

      if (mapped && set.has(mapped) && internal.stack.get(callee.name) === undefined) {
        if (requiresContextSet.has(callee.name) && t.isCallExpression(node)) {
          node.arguments.unshift(ctx);
        }
        return mapped;
      }
      return false;
    }

    const global = internal.stack.get(internal.global) === undefined;
    const cssGlobal = internal.stack.get(internal.cssGlobal) === undefined;

    if (!global && !cssGlobal) {
      return;
    }

    const propName = t.isMemberExpression(callee)
      ? t.isIdentifier(callee.property)
        ? callee.property.name
        : t.isStringLiteral(callee.property)
          ? callee.property.value
          : null
      : null;

    if (t.isMemberExpression(callee) && t.isIdentifier(callee.object) && propName) {
      if (global && callee.object.name === internal.global && set.has(propName)) {
        if (requiresContextSet.has(callee.object.name) && t.isCallExpression(node)) {
          node.arguments.unshift(ctx);
        }
        return callee.object.name;
      }
      if (cssGlobal && callee.object.name === internal.cssGlobal && set.has(propName)) {
        return callee.object.name;
      }
    }
  }

  return false;
}
