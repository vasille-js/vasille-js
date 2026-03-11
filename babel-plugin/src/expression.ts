import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { calls, dependencyInjections, hintFunctions } from "./call.js";
import { ctx, Internal, StackedStates, V } from "./internal.js";
import { checkNonReactiveName, err, Errors, ref } from "./lib";
import { ignoreParams, meshAllUnknown, meshExpression } from "./mesh";
import { routerReplace } from "./router";
import { stringify } from "./utils";

export interface Dependency {
  node: types.Expression;
  paramName: types.Identifier;
}

export interface Search {
  found: Map<string, Dependency>;
  external: Internal;
  self: types.Expression | null;
  inserted: Set<types.Expression>;
  stack: StackedStates;
}

function insertName(name: string, search?: Search): types.Identifier {
  const id = t.identifier(name);

  search?.inserted.add(id);

  return id;
}

function addExpression(path: NodePath<types.Expression>, search: Search) {
  const name = path
    .getSource()
    .trim()
    .replace(/\s*\n\s*/g, "");
  const found = search.found.get(name);

  if (path.isMemberExpression()) {
    let it: types.Expression | null = path.node;

    while (t.isMemberExpression(it) || t.isIdentifier(it)) {
      const name = stringify(t.isMemberExpression(it) ? it.property : it);

      if (it !== path.node && name.startsWith("$")) {
        err(Errors.RulesOfVasille, path, "The reactive/observable value is nested", search.external, null);
      }
      it = t.isMemberExpression(it) ? it.object : null;
    }
  }

  if (!found) {
    const paramName = insertName(`Vasille_${search.found.size}`, search);

    search.found.set(name, { node: path.node, paramName: paramName });
    path.replaceWith(paramName);
  } else {
    path.replaceWith(found.paramName);
  }
}

export function nodeIsMeshed(path: NodePath<types.Node | null | undefined>) {
  const parent = path.parent;

  return (t.isMemberExpression(parent) || t.isOptionalMemberExpression(parent)) && parent.property === V;
}

function meshIdentifier(path: NodePath<types.Identifier>) {
  if (idIsIValue(path) && !nodeIsMeshed(path)) {
    path.replaceWith(t.memberExpression(path.node, V));
  }
}

export function idIsIValue(path: NodePath<types.Identifier>): boolean {
  const node = path.node;

  return node.name.startsWith("$") && (!t.isMemberExpression(path.parent) || path.parent.object === node);
}

export function memberIsIValue(node: types.MemberExpression | types.OptionalMemberExpression) {
  return (
    (t.isIdentifier(node.property) && node.property.name.startsWith("$")) ||
    (t.isStringLiteral(node.property) && node.property.value.startsWith("$"))
  );
}

export function memberIsIValueInExpr(
  path: NodePath<types.MemberExpression | types.OptionalMemberExpression>,
  search: Search,
) {
  const node = path.node;
  const isIValue = memberIsIValue(node);

  if (isIValue) {
    let it: types.Expression = node;

    while (t.isMemberExpression(it) || t.isOptionalMemberExpression(it)) {
      it = it.object;
    }

    if (t.isIdentifier(it) && search.stack.get(it.name, true)) {
      err(
        Errors.RulesOfVasille,
        path,
        "This value looks like a reactive but is not. Move code to standalone function or wrap value in raw call.",
        search.external,
      );
    }
  }

  return isIValue;
}

export function exprIsSure(path: NodePath<types.Expression | null | undefined>, internal: Internal) {
  if (
    (path.isMemberExpression() &&
      path.node.computed &&
      (!t.isStringLiteral(path.node.property) || /^\d+$/.test(path.node.property.value))) ||
    path.isOptionalMemberExpression()
  ) {
    return false;
  }
  if (!path.isMemberExpression() || !stringify(path.node.property).startsWith("$")) {
    return true;
  }

  let it: types.Expression | null | undefined = path.node;
  let names: string[] = [];

  while (t.isMemberExpression(it) || t.isOptionalMemberExpression(it)) {
    names.push(stringify(it.property));
    it = it.object;
  }

  const reactivityData = t.isIdentifier(it) && internal.stack.get(it.name);
  const propPath = names.reverse().join(".");

  return (reactivityData && reactivityData[propPath]) || t.isMemberExpression(path.parent);
}

function meshMember(path: NodePath<types.MemberExpression | types.OptionalMemberExpression>) {
  if (memberIsIValue(path.node) && !nodeIsMeshed(path)) {
    path.replaceWith(t.memberExpression(path.node, V, false, true));
  }
}

function meshLValue(
  path: NodePath<types.LVal | types.OptionalMemberExpression | null | undefined>,
  internal: Internal,
) {
  if (path.isIdentifier()) {
    meshIdentifier(path);
  } else if (path.isMemberExpression() || path.isOptionalMemberExpression()) {
    const object = path.get("object") as NodePath<unknown>;

    meshMember(path);

    /* istanbul ignore else */
    if (object.isLVal()) {
      meshLValue(object, internal);
    }
  } else if (path.isArrayPattern()) {
    for (const item of path.get("elements")) {
      /* istanbul ignore else */
      if (item.isOptionalMemberExpression() || item.isLVal()) {
        meshLValue(item, internal);
      }
    }
  } else {
    /* istanbul ignore else */
    if (path.isRestElement()) {
      meshLValue(path.get("argument"), internal);
    }
  }
}

export function checkNode(
  path: NodePath<types.Node | null | undefined>,
  internal: Internal,
  area: types.Node,
  name?: string,
): Search {
  const search: Search = {
    external: internal,
    found: new Map(),
    self: null,
    inserted: new Set(),
    stack: internal.stack,
  };

  if (path.isIdentifier()) {
    if (idIsIValue(path)) {
      search.self = path.node;
    }
  }
  if (path.isMemberExpression() || path.isOptionalMemberExpression()) {
    if (memberIsIValue(path.node)) {
      search.self = path.node;
    }
  }
  if (path.isExpression() && calls(path, ["ref"], internal)) {
    const refValue = path.node.arguments[0];

    meshAllUnknown(path.get("arguments"), internal);
    path.replaceWith(ref(refValue, internal, area, name));
    search.self = path.node;
  }

  if (search.self) {
    return search;
  }

  internal.stack.push(true);

  /* istanbul ignore else */
  if (path.isExpression()) {
    checkExpression(path, search);
  }

  internal.stack.pop();

  return search;
}

export function checkOrIgnoreAllExpressions<T extends types.Node>(
  nodePaths: NodePath<types.Expression | null | T>[],
  search: Search,
) {
  for (const path of nodePaths) {
    /* istanbul ignore else */
    if (path.isExpression()) {
      checkExpression(path, search);
    }
  }
}

export function checkAllExpressions(nodePaths: NodePath<types.Expression | null>[], search: Search) {
  for (const path of nodePaths) {
    checkExpression(path, search);
  }
}

export function checkAllUnknown(
  paths: NodePath<types.SpreadElement | types.ArgumentPlaceholder | types.Expression | null>[],
  internal: Search,
) {
  for (const path of paths) {
    if (path.isSpreadElement()) {
      checkExpression(path.get("argument"), internal);
    } else {
      /* istanbul ignore else */
      if (path.isExpression()) {
        checkExpression(path, internal);
      }
    }
  }
}

export function checkOrIgnoreExpression<T extends types.Node>(
  path: NodePath<types.Expression | null | undefined | T>,
  search: Search,
) {
  /* istanbul ignore else */
  if (path.isExpression()) {
    checkExpression(path, search);
  }
}

export function checkExpression(nodePath: NodePath<types.Expression | null | undefined>, search: Search) {
  const expr = nodePath.node;

  switch (expr && expr.type) {
    case "TemplateLiteral": {
      const path = nodePath as NodePath<types.TemplateLiteral>;

      checkOrIgnoreAllExpressions<types.TSType>(path.get("expressions"), search);
      break;
    }
    case "TaggedTemplateExpression": {
      const path = nodePath as NodePath<types.TaggedTemplateExpression>;

      checkExpression(path.get("quasi"), search);
      path.get("");
      break;
    }
    case "Identifier": {
      /* istanbul ignore else */
      if (expr && nodePath.isIdentifier()) {
        if (idIsIValue(nodePath)) {
          addExpression(nodePath, search);
        }
      }
      break;
    }
    case "ArrayExpression": {
      const path = nodePath as NodePath<types.ArrayExpression>;

      checkAllUnknown(path.get("elements"), search);
      break;
    }
    case "CallExpression": {
      const path = nodePath as NodePath<types.CallExpression>;

      if (calls(path, ["router"], search.external)) {
        if (!search.external.stateOnly) {
          routerReplace(path);
        } else {
          err(Errors.IncompatibleContext, path, "The router is not available in stores", search.external, null);
        }
      } else if (
        calls(path, ["raw"], search.external) &&
        path.node.arguments.length === 1 &&
        t.isExpression(path.node.arguments[0])
      ) {
        meshExpression(path.get("arguments")[0] as NodePath<types.Expression>, search.external);
        path.replaceWith(path.node.arguments[0]);
      } else if (!search.external.stateOnly && calls(path, dependencyInjections, search.external)) {
        meshAllUnknown(path.get("arguments"), search.external);
        path.node.arguments.unshift(ctx);
      } else {
        if (calls(path, hintFunctions, search.external)) {
          err(Errors.IncompatibleContext, path, "Usage of hints is restricted here", search.external, null);
        }

        checkOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), search);
        checkAllUnknown(path.get("arguments"), search);
      }
      break;
    }
    case "OptionalCallExpression": {
      const path = nodePath as NodePath<types.OptionalCallExpression>;

      checkExpression(path.get("callee"), search);
      checkAllUnknown(path.get("arguments"), search);
      break;
    }
    case "AssignmentExpression": {
      const path = nodePath as NodePath<types.AssignmentExpression>;
      const left = path.get("left");
      const right = path.get("right");

      if (left.isMemberExpression() && !exprIsSure(left, search.external)) {
        const property = left.node.property;

        meshExpression(left.get("object"), search.external);
        checkExpression(right, search);

        /* istanbul ignore else */
        if (!t.isPrivateName(property)) {
          path.replaceWith(
            search.external.set(
              left.node.object,
              !left.node.computed && t.isIdentifier(property) ? t.stringLiteral(property.name) : property,
              right.node,
              path.node,
            ),
          );
        }
      } else {
        meshLValue(left, search.external);
        checkExpression(right, search);
      }
      break;
    }
    case "MemberExpression":
    case "OptionalMemberExpression": {
      const path = nodePath as NodePath<types.MemberExpression | types.OptionalMemberExpression>;

      if (memberIsIValueInExpr(path, search)) {
        addExpression(path, search);
      } else {
        checkExpression(path.get("object"), search);
        checkOrIgnoreExpression<types.PrivateName>(path.get("property"), search);
      }

      break;
    }
    case "BinaryExpression": {
      const path = nodePath as NodePath<types.BinaryExpression>;

      checkOrIgnoreExpression<types.PrivateName>(path.get("left"), search);
      checkExpression(path.get("right"), search);
      break;
    }
    case "ConditionalExpression": {
      const path = nodePath as NodePath<types.ConditionalExpression>;

      checkExpression(path.get("test"), search);
      checkExpression(path.get("consequent"), search);
      checkExpression(path.get("alternate"), search);
      break;
    }
    case "LogicalExpression": {
      const path = nodePath as NodePath<types.LogicalExpression>;

      checkExpression(path.get("left"), search);
      checkExpression(path.get("right"), search);
      break;
    }
    case "NewExpression": {
      const path = nodePath as NodePath<types.NewExpression>;

      checkOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), search);
      checkAllUnknown(path.get("arguments"), search);
      break;
    }
    case "SequenceExpression": {
      const path = nodePath as NodePath<types.SequenceExpression>;

      checkAllExpressions(path.get("expressions"), search);
      break;
    }
    case "UnaryExpression": {
      const path = nodePath as NodePath<types.UnaryExpression>;

      checkExpression(path.get("argument"), search);
      break;
    }
    case "UpdateExpression": {
      const path = nodePath as NodePath<types.UpdateExpression>;
      const arg = path.node.argument;

      /* istanbul ignore else */
      if (t.isLVal(arg)) {
        meshLValue(path.get("argument") as NodePath<types.LVal>, search.external);
      }
      break;
    }
    case "YieldExpression": {
      const path = nodePath as NodePath<types.YieldExpression>;

      checkExpression(path.get("argument"), search);
      break;
    }
    case "AwaitExpression": {
      const path = nodePath as NodePath<types.AwaitExpression>;

      checkExpression(path.get("argument"), search);
      break;
    }
    case "TSInstantiationExpression": {
      const path = nodePath as NodePath<types.TSInstantiationExpression>;

      checkExpression(path.get("expression"), search);
      break;
    }
    case "TSAsExpression": {
      const path = nodePath as NodePath<types.TSAsExpression>;

      checkExpression(path.get("expression"), search);
      break;
    }
    case "TSSatisfiesExpression": {
      const path = nodePath as NodePath<types.TSSatisfiesExpression>;

      checkExpression(path.get("expression"), search);
      break;
    }
    case "TSTypeAssertion": {
      const path = nodePath as NodePath<types.TSTypeAssertion>;

      checkExpression(path.get("expression"), search);
      break;
    }
    case "ObjectExpression": {
      const path = nodePath as NodePath<types.ObjectExpression>;

      for (const propPath of path.get("properties")) {
        if (propPath.isObjectProperty()) {
          const keyPath = propPath.get("key");
          const valuePath = propPath.get("value");

          if (
            propPath.node.computed ||
            !(
              keyPath.isIdentifier() &&
              valuePath.isIdentifier() &&
              keyPath.node.name.startsWith("$") === valuePath.node.name.startsWith("$")
            )
          ) {
            if (propPath.node.computed) {
              checkOrIgnoreExpression(propPath.get("key"), search);
            }
            checkOrIgnoreExpression<
              types.ArrayPattern | types.AssignmentPattern | types.ObjectPattern | types.RestElement | types.VoidPattern
            >(valuePath, search);
          }
        } else if (propPath.isObjectMethod()) {
          checkFunction(propPath, search);
        } else {
          checkAllUnknown([propPath as NodePath<t.SpreadElement>], search);
        }
      }
      break;
    }
    case "FunctionExpression": {
      checkFunction(nodePath as NodePath<types.FunctionExpression>, search);
      break;
    }
    case "ArrowFunctionExpression": {
      checkFunction(nodePath as NodePath<types.ArrowFunctionExpression>, search);
      break;
    }
    case "JSXFragment": {
      err(Errors.IncompatibleContext, nodePath, "JSX fragment is not allowed here", search.external, null);
      break;
    }
    case "JSXElement": {
      err(Errors.IncompatibleContext, nodePath, "JSX element is not allowed here", search.external, null);
      break;
    }
  }
}

export function checkStatements(paths: NodePath<types.Statement>[], search: Search) {
  for (const path of paths) {
    checkStatement(path, search);
  }
}

function ignoreLocals(path: NodePath<types.LVal | types.VariableDeclaration | types.VoidPattern>, search: Search) {
  const val = path.node;

  if (t.isVariableDeclaration(val)) {
    for (const declarator of (path as NodePath<types.VariableDeclaration>).get("declarations")) {
      ignoreParams(declarator.get("id"), search.external, ["id", "array"]);
    }
  } else {
    ignoreParams(path as NodePath<types.LVal>, search.external, ["id", "array"]);
  }
}

export function checkStatement(path: NodePath<types.Statement | null | undefined>, search: Search) {
  const statement = path.node;

  if (!statement) {
    return;
  }

  switch (statement.type) {
    case "BlockStatement":
      search.stack.push();
      checkStatements((path as NodePath<types.BlockStatement>).get("body"), search);
      search.stack.pop();
      break;

    case "DoWhileStatement": {
      const _path = path as NodePath<types.DoWhileStatement>;

      checkExpression(_path.get("test"), search);
      search.stack.push();
      checkStatement(_path.get("body"), search);
      search.stack.pop();
      break;
    }
    case "ExpressionStatement":
      checkExpression((path as NodePath<types.ExpressionStatement>).get("expression"), search);
      break;

    case "ForInStatement": {
      const _path = path as NodePath<types.ForInStatement>;

      ignoreLocals(_path.get("left"), search);
      checkExpression(_path.get("right"), search);

      checkStatement(_path.get("body"), search);
      break;
    }
    case "ForOfStatement": {
      const _path = path as NodePath<types.ForOfStatement>;
      checkExpression(_path.get("right"), search);
      search.stack.push();
      checkStatement(_path.get("body"), search);
      search.stack.pop();
      break;
    }
    case "ForStatement": {
      const _path = path as NodePath<types.ForStatement>;
      const node = _path.node;

      /* istanbul ignore else */
      if (node.init) {
        if (t.isExpression(node.init)) {
          checkExpression(_path.get("init") as NodePath<types.Expression>, search);
        } else {
          const variablePath = _path.get("init") as NodePath<types.VariableDeclaration>;

          for (const declarationPath of variablePath.get("declarations")) {
            checkExpression(declarationPath.get("init"), search);
          }
        }
      }

      checkExpression(_path.get("test"), search);
      checkExpression(_path.get("update"), search);
      search.stack.push();
      checkStatement(_path.get("body"), search);
      search.stack.pop();
      break;
    }
    case "FunctionDeclaration":
      checkFunction(path as NodePath<types.FunctionDeclaration>, search);
      break;

    case "IfStatement": {
      const _path = path as NodePath<types.IfStatement>;

      checkExpression(_path.get("test"), search);
      search.stack.push();
      checkStatement(_path.get("consequent"), search);
      search.stack.pop();
      search.stack.push();
      checkStatement(_path.get("alternate"), search);
      search.stack.pop();
      break;
    }

    case "LabeledStatement":
      search.stack.push();
      checkStatement((path as NodePath<types.LabeledStatement>).get("body"), search);
      search.stack.pop();
      break;

    case "ReturnStatement":
      checkExpression((path as NodePath<types.ReturnStatement>).get("argument"), search);
      break;

    case "SwitchStatement": {
      const _path = path as NodePath<types.SwitchStatement>;

      checkExpression(_path.get("discriminant"), search);
      search.stack.push();
      for (const _case of _path.get("cases")) {
        checkExpression(_case.get("test"), search);
        checkStatements(_case.get("consequent"), search);
      }
      search.stack.pop();
      break;
    }
    case "ThrowStatement":
      checkExpression((path as NodePath<types.ThrowStatement>).get("argument"), search);
      break;

    case "TryStatement":
      const handlerPath = (path as NodePath<types.TryStatement>).get("handler");

      checkStatement((path as NodePath<types.TryStatement>).get("block"), search);
      /* istanbul ignore else */
      if (handlerPath.node) {
        checkStatement((handlerPath as NodePath<types.CatchClause>).get("body"), search);
      }
      checkStatement((path as NodePath<types.TryStatement>).get("finalizer"), search);
      break;

    case "VariableDeclaration": {
      const _path = path as NodePath<types.VariableDeclaration>;

      for (const declaration of _path.get("declarations")) {
        ignoreLocals(declaration.get("id"), search);
        checkExpression(declaration.get("init"), search);
      }
      break;
    }
    case "WhileStatement": {
      const _path = path as NodePath<types.WhileStatement>;

      checkExpression(_path.get("test"), search);
      search.stack.push();
      checkStatement(_path.get("body"), search);
      search.stack.pop();
      break;
    }
  }
}

export function checkFunction(
  path: NodePath<
    types.ArrowFunctionExpression | types.FunctionExpression | types.FunctionDeclaration | types.ObjectMethod
  >,
  search: Search,
) {
  const node = path.node;

  for (const param of path.get("params")) {
    ignoreLocals(param, search);
  }

  if (path.isFunctionDeclaration() && path.node.id) {
    const idPath = path.get("id");

    /* istanbul ignore else */
    if (idPath.isIdentifier()) {
      search.stack.set(idPath.node.name, {});
      checkNonReactiveName(idPath, search.external);
    }
  }
  if (t.isFunctionExpression(node) && node.id) {
    search.stack.push();
    search.stack.set(node.id.name, {});
  }

  if (t.isExpression(node.body)) {
    checkExpression(path.get("body") as NodePath<types.Expression>, search);
  } else {
    const bodyPath = path.get("body") as NodePath<types.BlockStatement>;

    checkStatement(bodyPath, search);
  }

  if (t.isFunctionExpression(node) && node.id) {
    search.stack.pop();
  }
}
