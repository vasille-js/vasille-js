import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { checkNode, encodeName } from "./expression";
import { Internal, ctx } from "./internal";
import { calls } from "./call";

export function named (call: types.CallExpression, name: undefined|string|string[], internal: Internal, argPos?: number) {
  if (internal.devMode && name) {
    while (argPos && call.arguments.length < argPos) {
      call.arguments.push(t.buildUndefinedNode());
    }

    call.arguments.push(
      ...typeof name === "string" ? [t.stringLiteral(name)] : name.map(item => t.stringLiteral(item))
    )
  }

  return call;
}

export function parseCalculateCall(path: NodePath<types.Expression | null | undefined>, internal: Internal) {
  if (t.isCallExpression(path.node) && calls(path.node, ["calculate", "watch"], internal)) {
    if (path.node.arguments.length !== 1) {
      throw path.buildCodeFrameError("Vasille: Incorrect number of arguments");
    }
    if (t.isFunctionExpression(path.node.arguments[0]) || t.isArrowFunctionExpression(path.node.arguments[0])) {
      if (path.node.arguments[0].params.length > 0) {
        throw path.buildCodeFrameError("Vasille: Argument of calculate cannot have parameters");
      }

      const exprData = checkNode(
        (path as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<
          types.FunctionExpression | types.ArrowFunctionExpression
        >,
        internal,
      );

      path.node.arguments[0].params = [...exprData.found.keys()].map(name => encodeName(name));

      return [path.node.arguments[0], t.arrayExpression([...exprData.found.values()])];
    } else {
      throw path.buildCodeFrameError("Vasille: Argument of calculate must be a function");
    }
  }
  return null;
}

export function exprCall(
  path: NodePath<types.Expression | null | undefined>,
  expr: types.Expression | null | undefined,
  internal: Internal,
  name?: string,
) {
  const calculateCall = parseCalculateCall(path, internal);

  if (calculateCall) {
    return named(t.callExpression(t.memberExpression(ctx, t.identifier("expr")), calculateCall), name, internal);
  }

  const exprData = checkNode(path, internal);

  return exprData.self
    ? exprData.self
    : exprData.found.size > 0 && expr
      ? named(t.callExpression(t.memberExpression(ctx, t.identifier("expr")), [
        t.arrowFunctionExpression(
          [...exprData.found.keys()].map(name => encodeName(name)),
          expr,
        ),
        t.arrayExpression([...exprData.found.values()]),
      ]), name, internal)
      : null;
}

export function forwardOnlyExpr(
  path: NodePath<types.Expression | null | undefined>,
  expr: types.Expression | null | undefined,
  internal: Internal,
) {
  const calculateCall = parseCalculateCall(path, internal);

  if (calculateCall) {
    return t.callExpression(t.memberExpression(internal.id, t.identifier("ex")), calculateCall);
  }

  const exprData = checkNode(path, internal);

  return exprData.self
    ? t.callExpression(t.memberExpression(internal.id, t.identifier("fo")), [exprData.self])
    : exprData.found.size > 0 && expr
      ? t.callExpression(t.memberExpression(internal.id, t.identifier("ex")), [
          t.arrowFunctionExpression(
            [...exprData.found.keys()].map(name => encodeName(name)),
            expr,
          ),
          t.arrayExpression([...exprData.found.values()]),
        ])
      : null;
}

export function own(expr: types.Expression, internal: Internal, name?: string) {
  return named(t.callExpression(t.memberExpression(ctx, t.identifier("own")), [expr]), name, internal);
}

export function ref(expr: types.Expression | null | undefined, internal: Internal, name?: string) {
  return named(t.callExpression(t.memberExpression(ctx, t.identifier("ref")), expr ? [expr] : []), name, internal);
}

export function reactiveObject(init: types.Expression, internal: Internal, name?: string) {
  return named(t.callExpression(t.memberExpression(internal.id, t.identifier("ro")), [ctx, init]), name, internal);
}

export function arrayModel(init: types.Expression | null | undefined, internal: Internal, name?: string) {
  return named(t.callExpression(t.memberExpression(internal.id, t.identifier("am")), [ctx, ...(init ? [init] : [])]), name, internal);
}

export function setModel(args: types.CallExpression["arguments"], internal: Internal, name?: string) {
  return named(t.callExpression(t.memberExpression(internal.id, t.identifier("sm")), [ctx, ...args]), name, internal);
}

export function mapModel(args: types.CallExpression["arguments"], internal: Internal, name?: string) {
  return named(t.callExpression(t.memberExpression(internal.id, t.identifier("mm")), [ctx, ...args]), name, internal);
}
