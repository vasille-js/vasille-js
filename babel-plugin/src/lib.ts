import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { checkNode, encodeName } from "./expression.js";
import { Internal, ctx } from "./internal.js";
import { calls } from "./call.js";

export function named(
  call: types.CallExpression,
  name: undefined | string | string[],
  internal: Internal,
  argPos?: number,
) {
  if (internal.devMode && name) {
    while (argPos && call.arguments.length < argPos) {
      call.arguments.push(t.buildUndefinedNode());
    }

    call.arguments.push(
      ...(typeof name === "string" ? [t.stringLiteral(name)] : name.map(item => t.stringLiteral(item))),
    );
  }

  return call;
}

export function processCalculateCall(
  path: NodePath<types.CallExpression>,
  internal: Internal,
): [types.FunctionExpression | types.ArrowFunctionExpression, types.ArrayExpression] {
  const call = path.node.arguments[0];

  if (path.node.arguments.length !== 1) {
    throw path.buildCodeFrameError("Vasille: Incorrect number of arguments");
  }
  if (t.isFunctionExpression(call) || t.isArrowFunctionExpression(call)) {
    if (call.params.length > 0) {
      throw path.buildCodeFrameError("Vasille: Argument of calculate cannot have parameters");
    }

    const exprData = checkNode(
      (path as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<
        types.FunctionExpression | types.ArrowFunctionExpression
      >,
      internal,
    );

    call.params = [...exprData.found.keys()].map(name => encodeName(name));

    return [call, t.arrayExpression([...exprData.found.values()])];
  }

  throw path.buildCodeFrameError("Vasille: Argument of calculate must be a function");
}

export function parseCalculateCall(
  path: NodePath<types.Expression | null | undefined>,
  internal: Internal,
): [types.FunctionExpression | types.ArrowFunctionExpression, types.ArrayExpression] | null {
  if (t.isCallExpression(path.node) && calls(path, ["calculate", "watch"], internal)) {
    return processCalculateCall(path as NodePath<types.CallExpression>, internal);
  }
  return null;
}

export function exprCall(
  path: NodePath<types.Expression | null | undefined>,
  expr: types.Expression | null | undefined,
  internal: Internal,
  name?: string,
): types.Expression | null {
  const calculateCall = parseCalculateCall(path, internal);

  if (calculateCall) {
    return named(internal.expr(...calculateCall), name, internal);
  }

  if (
    t.isCallExpression(expr) &&
    calls(path, ["forward"], internal) &&
    expr.arguments.length === 1 &&
    t.isExpression(expr.arguments[0])
  ) {
    const data = exprCall(
      (path as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<types.Expression>,
      expr.arguments[0],
      internal,
    );

    /* istanbul ignore else */
    if (data && !t.isCallExpression(data)) {
      return internal.forward(data);
    }
  }

  const exprData = checkNode(path, internal);

  if (exprData.self) {
    return exprData.self;
  }

  const names = [...exprData.found.keys()].map(encodeName);
  const dependencies = t.arrayExpression([...exprData.found.values()]);

  if (expr !== path.node && names.length === 1 && t.isIdentifier(path.node) && path.node.name === names[0].name) {
    return [...exprData.found.values()][0];
  }
  if (names.length > 0 && path.node) {
    return named(internal.expr(t.arrowFunctionExpression(names, path.node), dependencies), name, internal);
  }

  return null;
}

export function forwardOnlyExpr(
  path: NodePath<types.Expression | null | undefined>,
  expr: types.Expression | null | undefined,
  internal: Internal,
) {
  const calculateCall = parseCalculateCall(path, internal);

  if (calculateCall) {
    return internal.expr(...calculateCall);
  }

  const exprData = checkNode(path, internal);

  return exprData.self
    ? internal.forward(exprData.self)
    : exprData.found.size > 0 && expr
      ? internal.expr(
          t.arrowFunctionExpression(
            [...exprData.found.keys()].map(name => encodeName(name)),
            expr,
          ),
          t.arrayExpression([...exprData.found.values()]),
        )
      : null;
}

export function ref(expr: types.Expression | null | undefined, internal: Internal, name?: string) {
  return named(internal.ref(expr), name, internal, 1);
}

export function arrayModel(init: types.Expression | null | undefined, internal: Internal, name?: string) {
  return named(internal.arrayModel(init), name, internal, 2);
}

export function setModel(args: types.CallExpression["arguments"], internal: Internal, name?: string) {
  return named(internal.setModel(args[0]), name, internal);
}

export function mapModel(args: types.CallExpression["arguments"], internal: Internal, name?: string) {
  return named(internal.mapModel(args[0]), name, internal);
}
