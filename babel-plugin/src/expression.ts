import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { calls, composeOnly } from "./call.js";
import { Internal, StackedStates, VariableScope, VariableState } from "./internal.js";

interface Search {
  found: Map<string, types.Expression>;
  external: Internal;
  self: types.Expression | null;
  stack: StackedStates;
}

export function encodeName(name: string): types.Identifier {
  return t.identifier(`Vasille_${name}`);
}

function addIdentifier(path: NodePath<types.Identifier>, search: Search) {
  if (!search.found.has(path.node.name)) {
    search.found.set(path.node.name, path.node);
  }
  path.replaceWith(encodeName(path.node.name));
}

function stringify(node: types.Expression | types.PrivateName) {
  let name = "";

  if (t.isStringLiteral(node)) {
    name = node.value;
  }
  if (t.isPrivateName(node)) {
    name = node.id.name;
  }
  if (t.isIdentifier(node)) {
    name = node.name;
  }

  return name;
}

function extractMemberName(path: NodePath<types.MemberExpression | types.OptionalMemberExpression>, search: Search) {
  const names: string[] = [];
  let it: types.Expression = path.node;

  while (t.isMemberExpression(it)) {
    const name = stringify(it.property);

    if (name === "$" && it !== path.node) {
      throw path.buildCodeFrameError("Vasille: The reactive/observable value is nested");
    }

    it = it.object;
    names.push(name);
  }

  names.push(stringify(it));

  if (
    t.isIdentifier(it) &&
    search.stack.get((it as types.Identifier).name, VariableScope.Local) === VariableState.Ignored
  ) {
    throw path.buildCodeFrameError(
      "Vasille: This node cannot be processed, the root of expression is a local variable",
    );
  }

  return names.reverse().join("_");
}

function addMemberExpr(path: NodePath<types.MemberExpression | types.OptionalMemberExpression>, search: Search) {
  const name = extractMemberName(path, search);

  if (!search.found.has(name)) {
    search.found.set(name, path.node);
  }
  path.replaceWith(encodeName(name));
}

function addExternalIValue(path: NodePath<types.MemberExpression | types.OptionalMemberExpression>, search: Search) {
  const name = extractMemberName(path, search);

  if (!search.found.has(name)) {
    search.found.set(name, path.node.object);
  }
  path.replaceWith(encodeName(name));
}

function meshIdentifier(path: NodePath<types.Identifier>, internal: Internal) {
  if (idIsIValue(path, internal)) {
    path.replaceWith(t.memberExpression(path.node, t.identifier("$")));
  }
}

export function idIsIValue(path: NodePath<types.Identifier>, internal: Internal, scope?: VariableScope): boolean {
  const node = path.node;

  return (
    REACTIVE_STATES.includes(internal.stack.get(node.name, scope)) &&
    (!t.isMemberExpression(path.parent) || path.parent.object === node)
  );
}

export function idIsLocal(path: NodePath<types.Identifier>, internal: Internal) {
  return internal.stack.get(path.node.name, VariableScope.Local) !== undefined;
}

export function memberIsIValue(
  node: types.MemberExpression | types.OptionalMemberExpression,
  internal: Internal,
  scope?: VariableScope,
) {
  return (
    (t.isIdentifier(node.object) &&
      (internal.stack.get(node.object.name, scope) === VariableState.ReactiveObject ||
        (t.isIdentifier(node.property) &&
          node.property.name.startsWith("$") &&
          !node.property.name.startsWith("$$") &&
          node.property.name !== "$") ||
        (t.isStringLiteral(node.property) &&
          node.property.value.startsWith("$") &&
          !node.property.value.startsWith("$$") &&
          node.property.value !== "$"))) ||
    (t.isMemberExpression(node.object) &&
      ((t.isIdentifier(node.object.property) && node.object.property.name.startsWith("$$")) ||
        (t.isStringLiteral(node.object.property) && node.object.property.value.startsWith("$$"))))
  );
}

export function nodeIsReactiveObject(path: NodePath<types.Expression | null | undefined>, internal: Internal) {
  const node = path.node;

  if (t.isIdentifier(node)) {
    return internal.stack.get(node.name) === VariableState.ReactiveObject;
  }
  if (t.isOptionalMemberExpression(node) || t.isMemberExpression(node)) {
    return (
      (t.isIdentifier(node.property) && node.property.name.startsWith("$$")) ||
      (t.isStringLiteral(node.property) && node.property.value.startsWith("$$"))
    );
  }
}

function meshMember(path: NodePath<types.MemberExpression | types.OptionalMemberExpression>, internal: Internal) {
  if (memberIsIValue(path.node, internal)) {
    path.replaceWith(t.memberExpression(path.node, t.identifier("$")));
  }
}

function meshLValue(
  path: NodePath<types.LVal | types.OptionalMemberExpression | null | undefined>,
  internal: Internal,
) {
  const node = path.node;

  if (t.isIdentifier(node)) {
    meshIdentifier(path as NodePath<types.Identifier>, internal);
  } else if (t.isMemberExpression(node) || t.isOptionalMemberExpression(node)) {
    meshMember(path as NodePath<types.MemberExpression | types.OptionalMemberExpression>, internal);
  } else if (t.isArrayPattern(node)) {
    for (const item of (path as NodePath<types.ArrayPattern>).get("elements")) {
      if (t.isOptionalMemberExpression(item.node) || t.isLVal(item.node)) {
        meshLValue(item as  NodePath<types.OptionalMemberExpression | types.LVal | null | undefined>, internal);
      }
    }
  } else if (t.isRestElement(node)) {
    meshLValue((path as NodePath<types.RestElement>).get("argument"), internal);
  }
}

export function checkNode(path: NodePath<types.Node | null | undefined>, internal: Internal): Search {
  const search: Search = {
    external: internal,
    found: new Map(),
    self: null,
    stack: internal.stack,
  };

  if (t.isIdentifier(path.node)) {
    if (idIsIValue(path as NodePath<types.Identifier>, internal)) {
      search.self = path.node;
    }
  }
  if (t.isMemberExpression(path.node)) {
    if (memberIsIValue(path.node, internal)) {
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

  if (t.isExpression(path.node)) {
    checkExpression(path as NodePath<types.Expression>, search);
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
    if (t.isExpression(path.node)) {
      checkExpression(path as NodePath<types.Expression>, search);
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
    if (t.isSpreadElement(path.node)) {
      checkExpression((path as NodePath<types.SpreadElement>).get("argument"), internal);
    } else if (t.isExpression(path.node)) {
      checkExpression(path as NodePath<types.Expression>, internal);
    }
  }
}

export function checkOrIgnoreExpression<T extends types.Node>(
  path: NodePath<types.Expression | null | undefined | T>,
  search: Search,
) {
  if (t.isExpression(path.node)) {
    checkExpression(path as NodePath<types.Expression>, search);
  }
}

const REACTIVE_STATES: (VariableState | undefined)[] = [VariableState.Reactive, VariableState.ReactivePointer];

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
      if (expr && t.isIdentifier(expr)) {
        if (
          idIsIValue(nodePath as NodePath<types.Identifier>, search.external, VariableScope.Global) &&
          !idIsLocal(nodePath as NodePath<types.Identifier>, search.external)
        ) {
          addIdentifier(nodePath as NodePath<types.Identifier>, search);
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

      if (calls(path.node, composeOnly, search.external)) {
        throw path.buildCodeFrameError("Vasille: Usage of hints is restricted here");
      }

      checkOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), search);
      checkAllUnknown(path.get("arguments"), search);
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

      if (memberIsIValue(node, search.external, VariableScope.Global)) {
        addMemberExpr(path, search);
      } else if (t.isIdentifier(node.property) && node.property.name === "$") {
        addExternalIValue(path, search);
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
      throw nodePath.buildCodeFrameError("Vasille: JSX fragment is not allowed here");
    }
    case "JSXElement": {
      throw nodePath.buildCodeFrameError("Vasille: JSX element is not allowed here");
    }
  }
}

export function checkStatements(paths: NodePath<types.Statement>[], search: Search) {
  for (const path of paths) {
    checkStatement(path, search);
  }
}

function ignoreLocals(val: types.LVal | types.VariableDeclaration | types.VoidPattern, search: Search) {
  if (t.isIdentifier(val)) {
    search.stack.set(val.name, VariableState.Ignored);
  } else if (t.isObjectPattern(val)) {
    for (const prop of val.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.value)) {
        search.stack.set(prop.value.name, VariableState.Ignored);
      } else if (t.isRestElement(prop) && t.isIdentifier(prop.argument)) {
        search.stack.set(prop.argument.name, VariableState.Ignored);
      } else if (t.isObjectProperty(prop) && t.isAssignmentPattern(prop.value)) {
        ignoreLocals(prop.value.left, search);
      }
    }
  } else if (t.isArrayPattern(val)) {
    for (const element of val.elements) {
      if (element && !t.isVoidPattern(element)) {
        ignoreLocals(element, search);
      }
    }
  } else if (t.isVariableDeclaration(val)) {
    for (const declarator of val.declarations) {
      if (!t.isVoidPattern(declarator.id)) {
        ignoreLocals(declarator.id, search);
      }
    }
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

      ignoreLocals(_path.node.left, search);
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
      if (handlerPath.node) {
        checkStatement((handlerPath as NodePath<types.CatchClause>).get("body"), search);
      }
      checkStatement((path as NodePath<types.TryStatement>).get("finalizer"), search);
      break;

    case "VariableDeclaration": {
      const _path = path as NodePath<types.VariableDeclaration>;

      for (const declaration of _path.get("declarations")) {
        ignoreLocals(declaration.node.id, search);
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

  for (const param of node.params) {
    ignoreLocals(param, search);
  }

  if (t.isExpression(node.body)) {
    checkExpression(path.get("body") as NodePath<types.Expression>, search);
  } else {
    const bodyPath = path.get("body") as NodePath<types.BlockStatement>;

    checkStatement(bodyPath, search);
  }
}
