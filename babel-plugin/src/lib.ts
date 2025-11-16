import { NodePath, types } from "@babel/core";
import { Identifier } from "@babel/types";
import * as t from "@babel/types";
import { checkNode, Dependency, exprIsSure } from "./expression.js";
import { Internal, ctx, inspector } from "./internal.js";
import { calls } from "./call.js";
import { meshAllUnknown } from "./mesh";
import { nodeToStaticPosition } from "./transformer";

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

export function processCalculateCall(
  path: NodePath<types.CallExpression>,
  internal: Internal,
  area: types.Node,
  name: string | undefined,
): boolean {
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

    call.params = [...exprData.found.values()].map(item => t.identifier(item.paramName));
    path.node.arguments.unshift(internal.isComposing ? ctx : t.nullLiteral());
    path.node.arguments.push(
      t.arrayExpression([...exprData.found.values()].map(item => item.node)),
      t.arrayExpression([...exprData.found.keys()].map(name => t.identifier(name))),
      nodeToStaticPosition(internal, area),
      inspector,
    );

    if (name) {
      path.replaceWith(internal.shareStateById(path.node, name));
    }

    return true;
  }

  return err(Errors.IncorrectArguments, path, "Argument of calculate must be a function", internal, false);
}

export function parseCalculateCall(
  path: NodePath<types.Expression | null | undefined>,
  internal: Internal,
  area: types.Node,
  name: string | undefined,
): boolean {
  if (path.isCallExpression() && calls(path, ["calculate", "watch"], internal)) {
    return processCalculateCall(path, internal, area, name);
  }
  return false;
}

export function bindCall(
  path: NodePath<types.Expression | null | undefined>,
  expr: types.Expression | null | undefined,
  data: Map<string, Dependency>,
  internal: Internal,
  name?: string,
) {
  const names = [...data.values()].map(item => t.identifier(item.paramName));
  const dependencies = [...data.values()].map(item => item.node);
  const codes = [...data.keys()];

  if (names.length > 0 && expr) {
    path.replaceWith(internal.expr(t.arrowFunctionExpression(names, expr), dependencies, codes, expr, name));

    return true;
  }

  return false;
}

export function exprCall(
  path: NodePath<types.Expression | null | undefined>,
  expr: types.Expression | null | undefined,
  internal: Internal,
  opts: {
    name?: string;
    strong?: boolean;
  },
  area: types.Node,
): boolean {
  if (parseCalculateCall(path, internal, area, opts.name)) {
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
      path.replaceWith(exprData.self);
    } else if (exprData.found.size > 0) {
      argPath.replaceWith(
        t.arrowFunctionExpression(
          [...exprData.found.values()].map(item => t.identifier(item.paramName)),
          argPath.node,
        ),
      );
      expr.arguments.unshift(internal.isComposing ? ctx : t.nullLiteral());
      expr.arguments.push(
        t.arrayExpression([...exprData.found.values()].map(item => item.node)),
        t.arrayExpression([...exprData.found.keys()].map(item => t.stringLiteral(item))),
        nodeToStaticPosition(internal, area),
        inspector,
      );

      if (opts.name) {
        path.replaceWith(internal.shareStateById(path.node, opts.name));
      }
    } else {
      path.replaceWith(internal.ref(argPath.node, area, opts.name));
    }

    return true;
  }

  const exprData = checkNode(path, internal);

  if (exprData.self) {
    if (!opts.strong || exprIsSure(path, internal)) {
      path.replaceWith(exprData.self);
    } else {
      path.replaceWith(internal.ensure(exprData.self, area));
    }

    return true;
  }

  return bindCall(path, expr, exprData.found, internal, opts.name);
}

export function ref(expr: types.Expression | null | undefined, internal: Internal, area: types.Node, name?: string) {
  return internal.ref(expr ?? null, area, name);
}

export function arrayModel(args: types.CallExpression["arguments"], internal: Internal, name?: string) {
  return internal.arrayModel(args[0], name);
}

export function setModel(args: types.CallExpression["arguments"], internal: Internal, name?: string) {
  return internal.setModel(args[0], name);
}

export function mapModel(args: types.CallExpression["arguments"], internal: Internal, name?: string) {
  return internal.mapModel(args[0], name);
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

export function checkReactiveName(idPath: NodePath<unknown>, internal: Internal) {
  if (!(idPath.isIdentifier() && idPath.node.name.startsWith("$"))) {
    err(Errors.RulesOfVasille, idPath, "Reactive variable name must start with $", internal);
  }
}

export function checkNonReactiveName(idPath: NodePath<Identifier>, internal: Internal) {
  if (idPath.node.name.startsWith("$")) {
    err(Errors.RulesOfVasille, idPath, "Non-reactive variable name must not start with $", internal);
  }
}
