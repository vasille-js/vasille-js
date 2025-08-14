import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { calls, composeOnly } from "./call.js";
import { Internal, StackedStates } from "./internal.js";
import { err, Errors } from "./lib";
import { ignoreParams } from "./mesh";
import { routerReplace } from "./router";
import { stringify } from "./utils";

export interface Search {
  found: Map<string, types.Expression>;
  external: Internal;
  self: types.Expression | null;
  inserted: Set<types.Expression>;
  stack: StackedStates;
}

export function encodeName(name: string) {
  return insertName(name);
}

function insertName(name: string, search?: Search): types.Identifier {
  const id = t.identifier(`Vasille_${name}`);

  search?.inserted.add(id);

  return id;
}

function addIdentifier(path: NodePath<types.Identifier>, search: Search) {
  const name = unprefixedName(path.node.name);

  if (!search.found.has(name)) {
    search.found.set(name, path.node);
  }

  path.replaceWith(insertName(name, search));
}

function unprefixedName(name: string): string {
  return name[0] === "$" ? name.slice(1) : name;
}

function extractMemberName(path: NodePath<types.MemberExpression | types.OptionalMemberExpression>, search: Search) {
  const names: string[] = [];
  let it: types.Expression = path.node;

  while (t.isMemberExpression(it)) {
    const name = stringify(it.property);

    if (name.startsWith("$") && it !== path.node) {
      err(Errors.RulesOfVasille, path, "The reactive/observable value is nested", search.external, null);
    }

    it = it.object;
    names.push(unprefixedName(name));
  }

  names.push(unprefixedName(stringify(it)));

  return names.reverse().join("_");
}

function addMemberExpr(path: NodePath<types.MemberExpression | types.OptionalMemberExpression>, search: Search) {
  const name = extractMemberName(path, search);

  /* istanbul ignore else */
  if (!search.found.has(name)) {
    search.found.set(name, path.node);
  }
  path.replaceWith(insertName(name, search));
}

function meshIdentifier(path: NodePath<types.Identifier>) {
  if (idIsIValue(path)) {
    path.replaceWith(t.memberExpression(path.node, t.identifier("V")));
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

function meshMember(path: NodePath<types.MemberExpression | types.OptionalMemberExpression>) {
  if (memberIsIValue(path.node)) {
    path.replaceWith(t.optionalMemberExpression(path.node, t.identifier("V"), false, true));
  }
}

function meshLValue(
  path: NodePath<types.LVal | types.OptionalMemberExpression | null | undefined>,
  internal: Internal,
) {
  const node = path.node;

  /* istanbul ignore else */
  if (path.isIdentifier()) {
    meshIdentifier(path);
  } else if (path.isMemberExpression() || path.isOptionalMemberExpression()) {
    meshMember(path);
  } else if (path.isArrayPattern()) {
    for (const item of path.get("elements")) {
      /* istanbul ignore else */
      if (item.isOptionalMemberExpression() || item.isLVal()) {
        meshLValue(item, internal);
      }
    }
  } else if (path.isRestElement()) {
    meshLValue(path.get("argument"), internal);
  }
}

export function checkNode(path: NodePath<types.Node | null | undefined>, internal: Internal): Search {
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
  if (path.isMemberExpression()) {
    if (memberIsIValue(path.node)) {
      search.self = path.node;
    } else if (t.isIdentifier(path.node.property) && path.node.property.name === "$") {
      search.self = path.node.object;
    }
  }

  if (search.self) {
    return search;
  }

  internal.stack.fixLocalIndex();
  internal.stack.push();

  /* istanbul ignore else */
  if (path.isExpression()) {
    checkExpression(path, search);
  }

  internal.stack.pop();
  internal.stack.resetLocalIndex();

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
    /* istanbul ignore else */
    if (path.isSpreadElement()) {
      checkExpression(path.get("argument"), internal);
    } else if (path.isExpression()) {
      checkExpression(path, internal);
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
          addIdentifier(nodePath, search);
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
      } else {
        if (calls(path, composeOnly, search.external)) {
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
      meshLValue(path.get("left"), search.external);
      checkExpression(path.get("right"), search);
      break;
    }
    case "MemberExpression":
    case "OptionalMemberExpression": {
      const path = nodePath as NodePath<types.MemberExpression | types.OptionalMemberExpression>;
      const node = path.node;

      if (memberIsIValue(node)) {
        addMemberExpr(path, search);
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
        const prop = propPath.node;

        if (t.isObjectProperty(prop)) {
          const path = propPath as NodePath<types.ObjectProperty>;
          const valuePath = path.get("value");

          if (path.node.computed) {
            checkOrIgnoreExpression(path.get("key"), search);
          }
          checkOrIgnoreExpression<
            types.ArrayPattern | types.AssignmentPattern | types.ObjectPattern | types.RestElement | types.VoidPattern
          >(valuePath, search);
        } else if (t.isObjectMethod(prop)) {
          checkFunction(propPath as NodePath<types.ObjectMethod>, search);
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
      ignoreParams(declarator.get("id"), search.external);
    }
  } else {
    ignoreParams(path as NodePath<types.LVal>, search.external);
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

  if (t.isExpression(node.body)) {
    checkExpression(path.get("body") as NodePath<types.Expression>, search);
  } else {
    const bodyPath = path.get("body") as NodePath<types.BlockStatement>;

    checkStatement(bodyPath, search);
  }
}
