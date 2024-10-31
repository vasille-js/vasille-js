import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, VariableState } from "./internal";

interface Search {
  found: Map<string, types.Expression>;
  extenal: Internal;
}

export function encodeName(name: string): types.Identifier {
  return t.identifier(`Vasille_${name}`);
}

function addIdentifier (path: NodePath<types.Identifier>, search: Search) {
  if (!search.found.has(path.node.name)) {
    search.found.set(path.node.name, path.node);
  }
  path.replaceWith(encodeName(path.node.name));
}

function stringify (node: types.Expression|types.PrivateName) {
  if (t.isIdentifier(node)) {
    return node.name;
  }
  if (t.isStringLiteral(node)) {
    return node.value;
  }
  if (t.isPrivateName(node)) {
    return node.id.name;
  }

  return '$';
}

function addMemberExpr (path: NodePath<types.MemberExpression|types.OptionalMemberExpression>, search: Search) {
  const names: string[] = [];
  let it:types.Expression = path.node;

  while(it instanceof t.memberExpression) {
    names.push(stringify(it.property));
  }

  names.push(stringify(it));

  const name = names.reverse().join('_');

  if (!search.found.has(name)) {
    search.found.set(name, path.node);
  }
  path.replaceWith(encodeName(name));
}

export function checkOrIgnoreAllExpressions<T extends types.Node>(nodePaths: NodePath<types.Expression | null | T>[], search: Search) {
  for (const path of nodePaths) {
      if (t.isExpression(path.node)){
      checkExpression(path as NodePath<types.Expression>, search);}
  }
}

export function checkAllExpressions(nodePaths: NodePath<types.Expression | null>[], search: Search) {
  for (const path of nodePaths) {
      checkExpression(path, search);
  }
}


export function checkAllUnknown(paths:NodePath<types.SpreadElement|types.ArgumentPlaceholder|types.Expression|null>[], internal:Search) {
  for (const path of paths) {
      if (t.isSpreadElement(path.node)) {
          checkExpression((path as NodePath<types.SpreadElement>).get("argument"), internal);
      } 
      else if (t.isExpression(path.node)) {
          checkExpression(path as NodePath<types.Expression>, internal);
      }
  }
}

export function chekOrIgnoreExpression<T extends types.Node>(path: NodePath<types.Expression | null | undefined|T>, search: Search){
if (t.isExpression(path.node)){
  checkExpression(path as NodePath<types.Expression>, search);}
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
          const state = search.extenal.stack.get(expr.name);

          if (state === VariableState.Reactive) {
              addIdentifier(nodePath as NodePath<types.Identifier>, search)
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
              checkExpression(path.get("right"), search);
          break;
      }
      case "MemberExpression":
      case "OptionalMemberExpression": {
          const path = nodePath as NodePath<types.MemberExpression | types.OptionalMemberExpression>;
          const node = path.node;

          checkExpression(path.get("object"), search);
          chekOrIgnoreExpression<types.PrivateName>(path.get("property"), search);

          if (t.isIdentifier(node.object) && search.extenal.stack.get(node.object.name) === VariableState.ReactiveObject) {
              addMemberExpr(path, search);
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
                      chekOrIgnoreExpression<types.ArrayPattern|types.AssignmentPattern|types.ObjectPattern|types.RestElement>(valuePath, search);
                  }
              } else if (t.isObjectMethod(prop)) {
                  meshFunction(propPath as NodePath<types.ObjectMethod>, search);
              } else {
                  checkAllUnknown([propPath as NodePath<typeof prop>], search);
              }
          }
          break;
      }
      case "FunctionExpression": {
          meshFunction(nodePath as NodePath<types.FunctionExpression>, search);
          break;
      }
      case "ArrowFunctionExpression": {
          meshFunction(nodePath as NodePath<types.ArrowFunctionExpression>, search);
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

export function meshBody(path: NodePath<types.BlockStatement | types.Expression>, search: Search) {
  if (t.isExpression(path.node)) {
      checkExpression(path as NodePath<types.Expression>, search);
  } else {
      for (const statementPath of (path as NodePath<types.BlockStatement>).get("body")) {
          meshStatement(statementPath, search);
      }
  }
}

export function meshStatements(paths: NodePath<types.Statement>[], search: Search) {
  for (const path of paths) {
      meshStatement(path, search);
  }
}

export function meshStatement(path: NodePath<types.Statement | null | undefined>, search: Search) {
  const statement = path.node;

  if (!statement) {
      return;
  }

  switch (statement.type) {
      case "BlockStatement":
          meshStatements((path as NodePath<types.BlockStatement>).get("body"), search);
          break;

      case "DoWhileStatement": {
          const _path = path as NodePath<types.DoWhileStatement>;

          checkExpression(_path.get("test"), search);
          meshStatement(_path.get("body"), search);
          break;
      }
      case "ExpressionStatement":
          checkExpression((path as NodePath<types.ExpressionStatement>).get("expression"), search);
          break;

      case "ForInStatement": {
          const _path = path as NodePath<types.ForInStatement>;
          const left = _path.node.left;

          checkExpression(_path.get("right"), search);
          meshStatement(_path.get("body"), search);
          break;
      }
      case "ForOfStatement": {
          const _path = path as NodePath<types.ForOfStatement>;

          checkExpression(_path.get("right"), search);
          meshStatement(_path.get("body"), search);
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
          meshStatement(_path.get("body"), search);
          break;
      }
      case "FunctionDeclaration":
          meshFunction(path as NodePath<types.FunctionDeclaration>, search);
          break;

      case "IfStatement": {
          const _path = path as NodePath<types.IfStatement>;

          checkExpression(_path.get("test"), search);
          meshStatement(_path.get("consequent"), search);
          meshStatement(_path.get("alternate"), search);
          break;
      }

      case "LabeledStatement":
          meshStatement((path as NodePath<types.LabeledStatement>).get("body"), search);
          break;

      case "ReturnStatement":
          checkExpression((path as NodePath<types.ReturnStatement>).get("argument"), search);
          break;

      case "SwitchStatement": {
          const _path = path as NodePath<types.SwitchStatement>;

          checkExpression(_path.get("discriminant"), search);
          for (const _case of _path.get("cases")) {
              checkExpression(_case.get("test"), search);
              meshStatements(_case.get("consequent"), search);
          }
          break;
      }
      case "ThrowStatement":
          checkExpression((path as NodePath<types.ThrowStatement>).get("argument"), search);
          break;

      case "TryStatement":
          meshStatement((path as NodePath<types.TryStatement>).get("block"), search);
          break;

      case "VariableDeclaration": {
          const _path = path as NodePath<types.VariableDeclaration>;

          for (const declaration of _path.get("declarations")) {
              const expr = declaration.node.init;

                  checkExpression(declaration.get("init"), search);
          }
          break;
      }
      case "WhileStatement": {
          const _path = path as NodePath<types.WhileStatement>;

          checkExpression(_path.get("test"), search);
          meshStatement(_path.get("body"), search);
          break;
      }
      case "WithStatement": {
          const _path = path as NodePath<types.WithStatement>;

          checkExpression(_path.get("object"), search);
          meshStatement(_path.get("body"), search);
          break;
      }
      case "ExportNamedDeclaration": {
          meshStatement((path as NodePath<types.ExportNamedDeclaration>).get("declaration"), search);
          break;
      }
  }
}

export function meshFunction(
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

      meshStatement(bodyPath, search);
  }
}
