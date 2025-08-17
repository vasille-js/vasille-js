import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { checkNode, encodeName } from "./expression.js";
import { Internal, ctx } from "./internal.js";
import { calls } from "./call.js";
import { meshAllUnknown } from "./mesh";

export enum Errors {
  IncorrectArguments = 1,
  IncompatibleContext = 2,
  TokenNotSupported = 3,
  Dilemma = 4,
  ParserError = 5,
  RulesOfVasille = 6,
}

export function err(e: Errors, node: NodePath<unknown>, content: string, internal: Internal, ret?: undefined): void;
export function err<T>(e: Errors, node: NodePath<unknown>, content: string, internal: Internal, ret: T): T;
export function err<T>(e: Errors, node: NodePath<unknown>, content: string, internal: Internal, ret: T): T {
  const limit = Error.stackTraceLimit;

  Error.stackTraceLimit = 0;

  const error = node.buildCodeFrameError(`Vasille[${e}]{${Errors[e]}}: ${content}`, Error);

  Error.stackTraceLimit = limit;

  if (!internal.firstError) {
    internal.firstError = error;
  }
  console.log(error);

  return ret;
}

function unprefixedName(name: string): string {
  return name[0] === "$" ? name.substring(1) : name;
}

export function named(
  call: types.CallExpression,
  name: undefined | string | string[],
  internal: Internal,
  argPos: number,
) {
  if (internal.devMode && name) {
    while (argPos && call.arguments.length < argPos) {
      call.arguments.push(t.buildUndefinedNode());
    }

    call.arguments.push(
      ...(typeof name === "string" ? [name] : name.map(item => item)).map(name =>
        t.stringLiteral(unprefixedName(name)),
      ),
    );
  }

  return call;
}

export function processCalculateCall(path: NodePath<types.CallExpression>, internal: Internal): boolean {
  const call = path.node.arguments[0];

  if (path.node.arguments.length !== 1) {
    return err(Errors.IncorrectArguments, path, "Incorrect number of arguments", internal, false);
  }
  if (t.isFunctionExpression(call) || t.isArrowFunctionExpression(call)) {
    if (call.params.length > 0) {
      return err(
        Errors.IncorrectArguments,
        path.get("arguments")[0],
        "Argument of calculate cannot have parameters",
        internal,
        false,
      );
    }

    const exprData = checkNode(
      (path as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<
        types.FunctionExpression | types.ArrowFunctionExpression
      >,
      internal,
    );

    call.params = [...exprData.found.keys()].map(name => encodeName(name));
    path.node.arguments.unshift(ctx);
    path.node.arguments.push(t.arrayExpression([...exprData.found.values()]));

    return true;
  }

  return err(Errors.IncorrectArguments, path, "Argument of calculate must be a function", internal, false);
}

export function parseCalculateCall(path: NodePath<types.Expression | null | undefined>, internal: Internal): boolean {
  if (path.isCallExpression() && calls(path, ["calculate", "watch"], internal)) {
    return processCalculateCall(path, internal);
  }
  return false;
}

export function bindCall(
  path: NodePath<types.Expression | null | undefined>,
  expr: types.Expression | null | undefined,
  data: Map<string, types.Expression>,
  internal: Internal,
  name?: string,
) {
  const names = [...data.keys()].map(encodeName);
  const dependencies = t.arrayExpression([...data.values()]);

  if (expr !== path.node && names.length === 1 && path.isIdentifier() && path.node.name === names[0].name) {
    path.replaceWith([...data.values()][0]);

    return true;
  }
  if (names.length > 0 && expr) {
    path.replaceWith(named(internal.expr(t.arrowFunctionExpression(names, expr), dependencies), name, internal, 3));

    return true;
  }

  return false;
}

export function exprCall(
  path: NodePath<types.Expression | null | undefined>,
  expr: types.Expression | null | undefined,
  internal: Internal,
  name?: string,
  acceptsForwarding?: boolean,
): boolean {
  if (parseCalculateCall(path, internal)) {
    named(path.node as types.CallExpression, name, internal, 3);

    return true;
  }

  if (
    t.isCallExpression(expr) &&
    calls(path, ["bind"], internal) &&
    expr.arguments.length === 1 &&
    t.isExpression(expr.arguments[0])
  ) {
    const argPath = (path as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<types.Expression>;
    const exprData = checkNode(argPath, internal);

    if (exprData.self) {
      path.replaceWith(internal.forward(exprData.self));
    } else if (exprData.found.size > 0) {
      argPath.replaceWith(t.arrowFunctionExpression([...exprData.found.keys()].map(encodeName), argPath.node));
      expr.arguments.unshift(ctx);
      expr.arguments.push(t.arrayExpression([...exprData.found.values()]));
      named(expr, name, internal, 3);
    } else {
      path.replaceWith(named(internal.ref(argPath.node), name, internal, 1));
    }

    return true;
  }

  if (
    acceptsForwarding &&
    t.isCallExpression(expr) &&
    calls(path, ["forward"], internal) &&
    expr.arguments.length === 1 &&
    t.isExpression(expr.arguments[0])
  ) {
    const exprData = checkNode(
      (path as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<types.Expression>,
      internal,
    );

    if (exprData.self) {
      expr.arguments[0] = exprData.self;
      expr.arguments.unshift(ctx);
      named(expr, name, internal, 2);
    } else if (!bindCall(path, expr.arguments[0], exprData.found, internal, name)) {
      path.replaceWith(internal.ref(expr.arguments[0]));
    }

    return true;
  }

  const exprData = checkNode(path, internal);

  if (exprData.self) {
    path.replaceWith(exprData.self);

    return true;
  }

  return bindCall(path, expr, exprData.found, internal, name);
}

export function ref(expr: types.Expression | null | undefined, internal: Internal, name?: string) {
  return named(internal.ref(expr), name, internal, 1);
}

export function arrayModel(args: types.CallExpression["arguments"], internal: Internal, name?: string) {
  return named(internal.arrayModel(args[0]), name, internal, 2);
}

export function setModel(args: types.CallExpression["arguments"], internal: Internal, name?: string) {
  return named(internal.setModel(args[0]), name, internal, 2);
}

export function mapModel(args: types.CallExpression["arguments"], internal: Internal, name?: string) {
  return named(internal.mapModel(args[0]), name, internal, 2);
}

export function processModelCall(
  path: NodePath<types.CallExpression | types.NewExpression>,
  type: "Map" | "Set" | "Array",
  isConst: boolean,
  internal: Internal,
  name?: string,
) {
  const args = path.node.arguments;

  if (!isConst) {
    err(Errors.RulesOfVasille, path, `${type} models must be declared as constants`, internal);
  }
  meshAllUnknown(path.get("arguments"), internal);
  path.replaceWith(
    type === "Map"
      ? mapModel(args, internal, name)
      : type === "Set"
        ? setModel(args, internal, name)
        : arrayModel(args, internal, name),
  );
}
