import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, StackedStates, VariableState } from "./internal";

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
  if (t.isIdentifier(node)) {
    return node.name;
  }
  if (t.isStringLiteral(node)) {
    return node.value;
  }
  if (t.isPrivateName(node)) {
    return node.id.name;
  }

  return "$";
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
    names.push();
  }

  names.push(stringify(it));

  if (t.isIdentifier(it) && search.stack.get((it as types.Identifier).name) === VariableState.Ignored) {
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
  const state = internal.stack.get(path.node.name);

  if (state === VariableState.Reactive || state === VariableState.ReactivePointer) {
    path.replaceWith(t.memberExpression(path.node, t.identifier("$")));
  }
}

function meshMember(path: NodePath<types.MemberExpression | types.OptionalMemberExpression>, internal: Internal) {
  if (t.isIdentifier(path.node.object) && internal.stack.get(path.node.object.name) === VariableState.ReactiveObject) {
    path.replaceWith(t.memberExpression(path.node, t.identifier("$")));
  }
}

function meshLValue(
  path: NodePath<types.LVal | types.OptionalMemberExpression | null | undefined>,
  internal: Internal,
) {
  if (t.isIdentifier(path.node)) {
    meshIdentifier(path as NodePath<types.Identifier>, internal);
  } else if (t.isMemberExpression(path.node) || t.isOptionalMemberExpression(path.node)) {
    meshMember(path as NodePath<types.MemberExpression | types.OptionalMemberExpression>, internal);
  } else {
    path.traverse({
      Identifier(path) {
        meshIdentifier(path, internal);
      },
      MemberExpression(path) {
        meshMember(path, internal);
      },
      OptionalMemberExpression(path) {
        meshMember(path, internal);
      },
    });
  }
}

export function checkNode(path: NodePath<types.Node | null | undefined>, internal: Internal): Search {
  const search: Search = {
    external: internal,
    found: new Map(),
    self: null,
    stack: new StackedStates(),
  };

  if (t.isIdentifier(path.node)) {
    const state = internal.stack.get(path.node.name);
    if (state === VariableState.Reactive || state == VariableState.ReactivePointer) {
      search.self = path.node;
    }
  }
  if (t.isMemberExpression(path.node)) {
    if (
      t.isIdentifier(path.node.object) &&
      internal.stack.get(path.node.object.name) === VariableState.ReactiveObject
    ) {
      search.self = path.node;
    }
    if (t.isIdentifier(path.node.property) && path.node.property.name === "$") {
      search.self = path.node.object;
    }
  }

  if (search.self) {
    return search;
  }

  if (t.isExpression(path.node)) {
    checkExpression(path as NodePath<types.Expression>, search);
  }

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

export function chekOrIgnoreExpression<T extends types.Node>(
  path: NodePath<types.Expression | null | undefined | T>,
  search: Search,
) {
  if (t.isExpression(path.node)) {
    checkExpression(path as NodePath<types.Expression>, search);
  }
}

export function checkExpression(nodePath: NodePath<types.Expression | null | undefined>, search: Search) {
  const expr = nodePath.node;

  if (!expr) {
    return;
  }
  switch (expr.type) {
    case "TemplateLiteral": {
      const path = nodePath as NodePath<types.TemplateLiteral>;

      checkOrIgnoreAllExpressions<types.TSType>(path.get("expressions"), search);
      break;
    }
    case "TaggedTemplateExpression": {
      const path = nodePath as NodePath<types.TaggedTemplateExpression>;

      checkExpression(path.get("quasi"), search);
      break;
    }
    case "Identifier": {
      if (search.stack.get(expr.name) !== VariableState.Ignored) {
        if (search.external.stack.get(expr.name) === VariableState.Reactive) {
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
    case "TupleExpression": {
      const path = nodePath as NodePath<types.TupleExpression>;

      checkAllUnknown(path.get("elements"), search);
      break;
    }
    case "CallExpression": {
      const path = nodePath as NodePath<types.CallExpression>;

      chekOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), search);
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

      checkExpression(path.get("object"), search);
      chekOrIgnoreExpression<types.PrivateName>(path.get("property"), search);

      if (t.isIdentifier(node.object) && search.external.stack.get(node.object.name) === VariableState.ReactiveObject) {
        addMemberExpr(path, search);
      } else if (t.isIdentifier(node.property) && node.property.name === "$") {
        addExternalIValue(path, search);
      }

      break;
    }
    case "BinaryExpression": {
      const path = nodePath as NodePath<types.BinaryExpression>;

      chekOrIgnoreExpression<types.PrivateName>(path.get("left"), search);
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

      chekOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), search);
      checkAllUnknown(path.get("arguments"), search);
      break;
    }
    case "SequenceExpression": {
      const path = nodePath as NodePath<types.SequenceExpression>;

      checkAllExpressions(path.get("expressions"), search);
      break;
    }
    case "ParenthesizedExpression": {
      const path = nodePath as NodePath<types.ParenthesizedExpression>;

      checkExpression(path.get("expression"), search);
      break;
    }
    case "UnaryExpression": {
      const path = nodePath as NodePath<types.UnaryExpression>;

      checkExpression(path.get("argument"), search);
      break;
    }
    case "UpdateExpression": {
      const path = nodePath as NodePath<types.UpdateExpression>;

      checkExpression(path.get("argument"), search);
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
    case "TypeCastExpression": {
      const path = nodePath as NodePath<types.TypeCastExpression>;

      checkExpression(path.get("expression"), search);
      break;
    }
    case "BindExpression": {
      const path = nodePath as NodePath<types.BindExpression>;

      checkExpression(path.get("callee"), search);
      checkExpression(path.get("object"), search);
      break;
    }
    case "PipelineTopicExpression": {
      const path = nodePath as NodePath<types.PipelineTopicExpression>;

      checkExpression(path.get("expression"), search);
      break;
    }
    case "PipelineBareFunction": {
      const path = nodePath as NodePath<types.PipelineBareFunction>;

      checkExpression(path.get("callee"), search);
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

          if (valuePath instanceof Array) {
            checkAllExpressions(valuePath, search);
          } else {
            chekOrIgnoreExpression<
              types.ArrayPattern | types.AssignmentPattern | types.ObjectPattern | types.RestElement
            >(valuePath, search);
          }
        } else if (t.isObjectMethod(prop)) {
          checkFunction(propPath as NodePath<types.ObjectMethod>, search);
        } else {
          checkAllUnknown([propPath as NodePath<typeof prop>], search);
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

function ignoreLocals(val: types.LVal | types.VariableDeclaration, search: Search) {
  if (t.isAssignmentPattern(val)) {
    val = val.left;
  }
  if (t.isIdentifier(val)) {
    search.stack.set(val.name, VariableState.Ignored);
  } else if (t.isObjectPattern(val)) {
    for (const prop of val.properties) {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.value)) {
        search.stack.set(prop.value.name, VariableState.Ignored);
      } else if (t.isRestElement(prop) && t.isIdentifier(prop.argument)) {
        search.stack.set(prop.argument.name, VariableState.Ignored);
      }
    }
  } else if (t.isArrayPattern(val)) {
    for (const element of val.elements) {
      if (element) {
        ignoreLocals(element, search);
      }
    }
  } else if (t.isVariableDeclaration(val)) {
    for (const declarator of val.declarations) {
      ignoreLocals(declarator.id, search);
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
      checkStatement((path as NodePath<types.TryStatement>).get("block"), search);
      break;

    case "VariableDeclaration": {
      const _path = path as NodePath<types.VariableDeclaration>;

      for (const declaration of _path.get("declarations")) {
        const expr = declaration.node.init;

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
    case "WithStatement": {
      const _path = path as NodePath<types.WithStatement>;

      checkExpression(_path.get("object"), search);
      search.stack.push();
      checkStatement(_path.get("body"), search);
      search.stack.pop();
      break;
    }
    case "ExportNamedDeclaration": {
      checkStatement((path as NodePath<types.ExportNamedDeclaration>).get("declaration"), search);
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

  if (t.isExpression(node.body)) {
    checkExpression(path.get("body") as NodePath<types.Expression>, search);
  } else {
    const bodyPath = path.get("body") as NodePath<types.BlockStatement>;

    checkStatement(bodyPath, search);
  }
}
