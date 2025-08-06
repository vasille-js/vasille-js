import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { processBridgeCall } from "./bridge";
import { calls, composeOnly, styleOnly } from "./call.js";
import { idIsIValue, memberIsIValue, nodeIsReactiveObject } from "./expression.js";
import { ctx, Internal, VariableState } from "./internal.js";
import { transformJsx } from "./jsx.js";
import {
  arrayModel,
  exprCall,
  forwardOnlyExpr,
  mapModel,
  named,
  own,
  parseCalculateCall,
  reactiveObject,
  ref,
  setModel,
} from "./lib.js";
import { routerReplace } from "./router";
import { stringify } from "./utils";

export type ComposeMethods = "slot" | "compose" | "view" | "mvvmView" | "mvcView" | "hybridView" | "store";

const composePropsIndex: { [k in ComposeMethods]: number } = {
  slot: 0,
  compose: 0,
  view: 0,
  mvvmView: 0,
  mvcView: -1,
  hybridView: 1,
  store: 0,
};
const composeArgsNumber: { [k in ComposeMethods]: number } = {
  slot: 1,
  compose: 1,
  view: 1,
  mvvmView: 1,
  mvcView: 1,
  hybridView: 2,
  store: 1,
};

export function meshOrIgnoreAllExpressions<T extends types.Node>(
  nodePaths: NodePath<types.Expression | null | T>[],
  internal: Internal,
) {
  for (const path of nodePaths) {
    /* istanbul ignore else */
    if (t.isExpression(path.node)) {
      meshExpression(path as NodePath<types.Expression>, internal);
    }
  }
}

export function meshAllExpressions(nodePaths: NodePath<types.Expression | null>[], internal: Internal) {
  for (const path of nodePaths) {
    meshExpression(path, internal);
  }
}

export function meshComposeCall(
  call: types.CallExpression,
  name: types.Identifier | null,
  nodePath: NodePath<types.Node | null | undefined>,
  method: ComposeMethods,
  internal: Internal,
) {
  const arg = call.arguments[0];

  if (call.arguments.length !== 1 || !(t.isFunctionExpression(arg) || t.isArrowFunctionExpression(arg))) {
    throw nodePath.buildCodeFrameError("Vasille: Invalid arguments");
  }

  const fnPath = (nodePath as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<
    types.FunctionExpression | types.ArrowFunctionExpression
  >;

  const nonePropsFields = compose(fnPath, internal, false, method);

  if (composeArgsNumber[method] > 1) {
    call.arguments.push(t.arrayExpression(nonePropsFields.map(item => t.stringLiteral(item))));
  }

  if (!internal.stateOnly) {
    arg.params.unshift(ctx);
  }

  if (internal.devMode) {
    call.arguments.push(t.stringLiteral(`${internal.prefix}:${name ? name.name : "#anonymouse"}`));
  }
}

export function meshAllUnknown(
  paths: NodePath<types.SpreadElement | types.ArgumentPlaceholder | types.Expression | null>[],
  internal: Internal,
) {
  for (const path of paths) {
    /* istanbul ignore else */
    if (t.isSpreadElement(path.node)) {
      meshExpression((path as NodePath<types.SpreadElement>).get("argument"), internal);
    } else if (t.isExpression(path.node)) {
      meshExpression(path as NodePath<types.Expression>, internal);
    }
  }
}

export function meshLValue(path: NodePath<types.LVal | types.Expression>, internal: Internal) {
  const node = path.node;

  /* istanbul ignore else */
  if (t.isExpression(node)) {
    meshExpression(path as NodePath<typeof node>, internal);
  }
}

export function meshOrIgnoreExpression<T extends types.Node>(
  path: NodePath<types.Expression | types.VoidPattern | null | undefined | T>,
  internal: Internal,
) {
  /* istanbul ignore else */
  if (t.isExpression(path.node)) {
    meshExpression(path as NodePath<types.Expression>, internal);
  }
}

export function meshExpression(
  nodePath: NodePath<types.Expression | null | undefined>,
  internal: Internal,
  isRoot?: boolean,
) {
  const expr = nodePath.node;

  if (!expr) {
    return;
  }

  let composeMethod = calls(nodePath, ["compose", "store", "view", "mvvmView", "mvcView", "hybridView"], internal);

  if (composeMethod) {
    meshComposeCall(expr as types.CallExpression, null, nodePath, composeMethod, internal);

    return;
  }
  switch (expr.type) {
    case "TemplateLiteral": {
      const path = nodePath as NodePath<types.TemplateLiteral>;

      meshOrIgnoreAllExpressions<types.TSType>(path.get("expressions"), internal);
      break;
    }
    case "TaggedTemplateExpression": {
      const path = nodePath as NodePath<types.TaggedTemplateExpression>;

      meshExpression(path.get("quasi"), internal);
      break;
    }
    case "Identifier": {
      const state = internal.stack.get(expr.name);

      if (idIsIValue(nodePath as NodePath<types.Identifier>, internal)) {
        nodePath.replaceWith(
          t.memberExpression(expr, t.identifier(state === VariableState.ReactivePointer ? "$$" : "$")),
        );
      }
      break;
    }
    case "ArrayExpression": {
      const path = nodePath as NodePath<types.ArrayExpression>;

      meshAllUnknown(path.get("elements"), internal);
      break;
    }
    case "CallExpression":
    case "OptionalCallExpression": {
      const path = nodePath as NodePath<types.CallExpression>;

      if (internal.isComposing && calls(path, ["router"], internal)) {
        if (!internal.stateOnly) {
          routerReplace(path);
        } else {
          throw path.buildCodeFrameError("Vasille: The router is not available in stores");
        }
      } else {
        const callsFn = calls(path, composeOnly, internal);
        const callsStyleHint = calls(path, styleOnly, internal);

        if (callsFn) {
          throw path.buildCodeFrameError(`Vasille: Usage of hint "${callsFn}" is restricted here`);
        }
        if (callsStyleHint) {
          throw path.buildCodeFrameError(`Vasille: Usage of style hint "${callsStyleHint}" is restricted here`);
        }

        if (!processBridgeCall(path, internal)) {
          meshOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), internal);
          meshAllUnknown(path.get("arguments"), internal);
        }
      }

      break;
    }
    case "AssignmentExpression": {
      const path = nodePath as NodePath<types.AssignmentExpression>;
      const left = path.node.left;
      let replaced = false;

      meshLValue(path.get("left"), internal);

      if (t.isIdentifier(left) && internal.stack.get(left.name) === VariableState.ReactivePointer) {
        const replaceWith = forwardOnlyExpr(path.get("right"), path.node.right, internal);

        if (replaceWith) {
          path.get("right").replaceWith(replaceWith);
          replaced = true;
        }
      }
      if (!replaced) {
        meshExpression(path.get("right"), internal);
      }
      break;
    }
    case "MemberExpression":
    case "OptionalMemberExpression": {
      const path = nodePath as NodePath<types.MemberExpression | types.OptionalMemberExpression>;
      const node = path.node;
      const property = path.node.property;

      meshExpression(path.get("object"), internal);
      if (t.isExpression(property) && !t.isIdentifier(property)) {
        meshOrIgnoreExpression<types.PrivateName>(path.get("property"), internal);
      }

      if (memberIsIValue(node, internal)) {
        path.replaceWith(t.memberExpression(node, t.identifier("$")));
      }

      break;
    }
    case "BinaryExpression": {
      const path = nodePath as NodePath<types.BinaryExpression>;

      meshOrIgnoreExpression<types.PrivateName>(path.get("left"), internal);
      meshExpression(path.get("right"), internal);
      break;
    }
    case "ConditionalExpression": {
      const path = nodePath as NodePath<types.ConditionalExpression>;

      meshExpression(path.get("test"), internal);
      meshExpression(path.get("consequent"), internal);
      meshExpression(path.get("alternate"), internal);
      break;
    }
    case "LogicalExpression": {
      const path = nodePath as NodePath<types.LogicalExpression>;

      meshExpression(path.get("left"), internal);
      meshExpression(path.get("right"), internal);
      break;
    }
    case "NewExpression": {
      const path = nodePath as NodePath<types.NewExpression>;

      meshOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), internal);
      meshAllUnknown(path.get("arguments"), internal);
      break;
    }
    case "SequenceExpression": {
      const path = nodePath as NodePath<types.SequenceExpression>;

      meshAllExpressions(path.get("expressions"), internal);
      break;
    }
    case "UnaryExpression": {
      const path = nodePath as NodePath<types.UnaryExpression>;

      meshExpression(path.get("argument"), internal);
      break;
    }
    case "UpdateExpression": {
      const path = nodePath as NodePath<types.UpdateExpression>;

      meshExpression(path.get("argument"), internal);
      break;
    }
    case "YieldExpression": {
      const path = nodePath as NodePath<types.YieldExpression>;

      meshExpression(path.get("argument"), internal);
      break;
    }
    case "AwaitExpression": {
      const path = nodePath as NodePath<types.AwaitExpression>;

      meshExpression(path.get("argument"), internal);
      break;
    }
    case "TSInstantiationExpression": {
      const path = nodePath as NodePath<types.TSInstantiationExpression>;

      meshExpression(path.get("expression"), internal);
      break;
    }
    case "TSAsExpression": {
      const path = nodePath as NodePath<types.TSAsExpression>;

      meshExpression(path.get("expression"), internal);
      break;
    }
    case "TSSatisfiesExpression": {
      const path = nodePath as NodePath<types.TSSatisfiesExpression>;

      meshExpression(path.get("expression"), internal);
      break;
    }
    case "TSTypeAssertion": {
      const path = nodePath as NodePath<types.TSTypeAssertion>;

      meshExpression(path.get("expression"), internal);
      break;
    }
    case "ObjectExpression": {
      const path = nodePath as NodePath<types.ObjectExpression>;

      for (const propPath of path.get("properties")) {
        const prop = propPath.node;

        if (t.isObjectProperty(prop)) {
          const path = propPath as NodePath<types.ObjectProperty>;
          const valuePath = path.get("value");
          let replaced = false;

          if (
            isRoot &&
            internal.stateOnly &&
            !path.node.computed &&
            (t.isIdentifier(path.node.key) || t.isStringLiteral(path.node.key)) &&
            t.isExpression(valuePath.node)
          ) {
            const call = exprCall(valuePath as NodePath<types.Expression>, valuePath.node, internal);

            if (call) {
              if (stringify(path.node.key).startsWith("$")) {
                valuePath.replaceWith(call);
              } else {
                throw path.buildCodeFrameError("Vasille: Reactive value property name must start with $");
              }
              replaced = true;
            } else if (
              t.isIdentifier(valuePath.node) &&
              internal.stack.get(valuePath.node.name) === VariableState.ReactiveObject
            ) {
              if (!stringify(path.node.key).startsWith("$$")) {
                throw path.buildCodeFrameError("Vasille: Reactive object property name must start with $$");
              }
            } else if (stringify(path.node.key).startsWith("$")) {
              throw path.buildCodeFrameError("Vasille: This property is not a reactive value or object");
            }
          }
          if (!replaced) {
            meshOrIgnoreExpression<
              types.ArrayPattern | types.AssignmentPattern | types.ObjectPattern | types.RestElement
            >(valuePath, internal);
          }
        } else if (t.isObjectMethod(prop)) {
          if (stringify(prop.key).startsWith("$")) {
            throw propPath.buildCodeFrameError("Vasille: Method name stating with $ is not allowed");
          }
          meshFunction(propPath as NodePath<types.ObjectMethod>, internal);
        } else if (isRoot && internal.stateOnly && t.isSpreadElement(prop)) {
          throw propPath.buildCodeFrameError("Vasille: Spread element is not allowed here");
        } else {
          meshAllUnknown([propPath as NodePath<typeof prop>], internal);
        }
      }
      break;
    }
    case "FunctionExpression": {
      meshFunction(nodePath as NodePath<types.FunctionExpression>, internal);
      break;
    }
    case "ArrowFunctionExpression": {
      meshFunction(nodePath as NodePath<types.ArrowFunctionExpression>, internal);
      break;
    }
    case "ClassExpression": {
      meshClassBody((nodePath as NodePath<types.ClassExpression>).get("body"), internal);
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

export function meshStatements(paths: NodePath<types.Statement>[], internal: Internal) {
  for (const path of paths) {
    meshStatement(path, internal);
  }
}

export function ignoreParams(val: types.LVal | types.VoidPattern, internal: Internal) {
  /* istanbul ignore else */
  if (t.isAssignmentPattern(val)) {
    val = val.left;
  }
  /* istanbul ignore else */
  if (t.isIdentifier(val)) {
    internal.stack.set(val.name, VariableState.Ignored);
  } else if (t.isObjectPattern(val)) {
    ignoreObjectPattern(val, internal);
  } else if (t.isArrayPattern(val)) {
    for (const element of val.elements) {
      if (element) {
        ignoreParams(element, internal);
      }
    }
  }
}

function ignoreObjectPattern(pattern: types.ObjectPattern, internal: Internal) {
  for (const property of pattern.properties) {
    /* istanbul ignore else */
    if (t.isObjectProperty(property)) {
      /* istanbul ignore else */
      if (t.isObjectPattern(property.value)) {
        ignoreObjectPattern(property.value, internal);
      } else if (t.isAssignmentPattern(property.value)) {
        ignoreParams(property.value, internal);
      } else if (t.isIdentifier(property.value)) {
        internal.stack.set(property.value.name, VariableState.Ignored);
      }
    }
    /* istanbul ignore else */
    if (t.isRestElement(property)) {
      internal.stack.set((property.argument as types.Identifier).name, VariableState.Ignored);
    }
  }
}

export function reactiveArrayPattern(
  path: NodePath<types.LVal | types.OptionalMemberExpression | types.VoidPattern>,
  internal: Internal,
) {
  if (t.isArrayPattern(path.node)) {
    path.node.elements.forEach((element, index) => {
      /* istanbul ignore else */
      if (t.isIdentifier(element)) {
        internal.stack.set(element.name, index < 2 ? VariableState.Reactive : VariableState.Ignored);
      }
    });
  } else {
    throw path.buildCodeFrameError("Vasille: Expected array pattern");
  }
}

function meshForEachHeader(path: NodePath<types.ForInStatement | types.ForOfStatement>, internal: Internal) {
  const left = path.node.left;

  meshExpression(path.get("right"), internal);
  /* istanbul ignore else */
  if (t.isVariableDeclaration(left) && t.isVariableDeclarator(left.declarations[0])) {
    ignoreParams(left.declarations[0].id, internal);
  }
}

function meshForHeader(path: NodePath<types.ForStatement>, internal: Internal) {
  const node = path.node;

  /* istanbul ignore else */
  if (node.init) {
    if (t.isExpression(node.init)) {
      meshExpression(path.get("init") as NodePath<types.Expression>, internal);
    } else {
      const variablePath = path.get("init") as NodePath<types.VariableDeclaration>;

      for (const declarationPath of variablePath.get("declarations")) {
        meshExpression(declarationPath.get("init"), internal);
        ignoreParams(declarationPath.node.id, internal);
      }
    }
  }

  meshExpression(path.get("test"), internal);
  meshExpression(path.get("update"), internal);
}

function meshClassBody(path: NodePath<types.ClassBody>, internal: Internal) {
  for (const item of path.get("body")) {
    /* istanbul ignore else */
    if (t.isClassMethod(item.node) || t.isClassPrivateMethod(item.node)) {
      meshFunction(item as NodePath<types.ClassMethod | types.ClassPrivateMethod>, internal);
    } else if (
      t.isClassAccessorProperty(item.node) ||
      t.isClassPrivateProperty(item.node) ||
      t.isClassProperty(item.node)
    ) {
      meshExpression(item.get("value"), internal);
    }
  }
}

export function meshStatement(path: NodePath<types.Statement | null | undefined>, internal: Internal) {
  const statement = path.node;

  switch (statement && statement.type) {
    case "BlockStatement":
      internal.stack.push();
      meshStatements((path as NodePath<types.BlockStatement>).get("body"), internal);
      internal.stack.pop();
      break;

    case "DoWhileStatement": {
      const _path = path as NodePath<types.DoWhileStatement>;

      meshExpression(_path.get("test"), internal);
      internal.stack.push();
      meshStatement(_path.get("body"), internal);
      internal.stack.pop();
      break;
    }
    case "ExpressionStatement":
      meshExpression((path as NodePath<types.ExpressionStatement>).get("expression"), internal);
      break;

    case "ForInStatement": {
      const _path = path as NodePath<types.ForInStatement>;

      internal.stack.push();
      meshForEachHeader(_path, internal);
      meshStatement(_path.get("body"), internal);
      internal.stack.pop();
      break;
    }
    case "ForOfStatement": {
      const _path = path as NodePath<types.ForOfStatement>;

      internal.stack.push();
      meshForEachHeader(_path, internal);
      meshStatement(_path.get("body"), internal);
      internal.stack.pop();
      break;
    }
    case "ForStatement": {
      const _path = path as NodePath<types.ForStatement>;

      internal.stack.push();
      meshForHeader(_path, internal);
      meshStatement(_path.get("body"), internal);
      internal.stack.pop();
      break;
    }
    case "FunctionDeclaration":
      meshFunction(path as NodePath<types.FunctionDeclaration>, internal);
      break;

    case "IfStatement": {
      const _path = path as NodePath<types.IfStatement>;

      meshExpression(_path.get("test"), internal);
      internal.stack.push();
      meshStatement(_path.get("consequent"), internal);
      internal.stack.pop();
      internal.stack.push();
      meshStatement(_path.get("alternate"), internal);
      internal.stack.pop();
      break;
    }

    case "LabeledStatement":
      meshStatement((path as NodePath<types.LabeledStatement>).get("body"), internal);
      break;

    case "ReturnStatement":
      meshExpression((path as NodePath<types.ReturnStatement>).get("argument"), internal);
      break;

    case "SwitchStatement": {
      const _path = path as NodePath<types.SwitchStatement>;

      meshExpression(_path.get("discriminant"), internal);
      internal.stack.push();
      for (const _case of _path.get("cases")) {
        meshExpression(_case.get("test"), internal);
        meshStatements(_case.get("consequent"), internal);
      }
      internal.stack.pop();
      break;
    }
    case "ThrowStatement":
      meshExpression((path as NodePath<types.ThrowStatement>).get("argument"), internal);
      break;

    case "TryStatement":
      meshStatement((path as NodePath<types.TryStatement>).get("block"), internal);
      /* istanbul ignore else */
      if ((path as NodePath<types.TryStatement>).node.handler) {
        meshStatement(
          ((path as NodePath<types.TryStatement>).get("handler") as NodePath<types.CatchClause>).get("body"),
          internal,
        );
      }
      meshStatement((path as NodePath<types.TryStatement>).get("finalizer"), internal);
      break;

    case "VariableDeclaration": {
      const _path = path as NodePath<types.VariableDeclaration>;

      for (const declaration of _path.get("declarations")) {
        const expr = declaration.node.init;
        const initPath = declaration.get("init");
        const composeMethod = calls(
          initPath,
          ["compose", "store", "view", "mvvmView", "mvcView", "hybridView"],
          internal,
        );

        if (expr && t.isIdentifier(declaration.node.id) && composeMethod) {
          meshComposeCall(
            expr as types.CallExpression,
            declaration.node.id,
            declaration.get("init"),
            composeMethod,
            internal,
          );
        } else {
          meshExpression(declaration.get("init"), internal);
          ignoreParams(declaration.node.id, internal);
        }
      }
      break;
    }
    case "WhileStatement": {
      const _path = path as NodePath<types.WhileStatement>;

      meshExpression(_path.get("test"), internal);
      internal.stack.push();
      meshStatement(_path.get("body"), internal);
      internal.stack.pop();
      break;
    }
    case "ExportNamedDeclaration": {
      meshStatement((path as NodePath<types.ExportNamedDeclaration>).get("declaration"), internal);
      break;
    }
    case "ClassDeclaration":
      meshClassBody((path as NodePath<types.ClassDeclaration>).get("body"), internal);
      break;

    case "ExportDefaultDeclaration": {
      const declarationPath = (path as NodePath<types.ExportDefaultDeclaration>).get("declaration");

      /* istanbul ignore else */
      if (t.isExpression(declarationPath.node)) {
        meshExpression(declarationPath as NodePath<types.Expression>, internal);
      } else if (t.isFunctionDeclaration(declarationPath.node)) {
        meshFunction(declarationPath as NodePath<types.FunctionDeclaration>, internal);
      } else if (t.isClassDeclaration(declarationPath.node)) {
        meshClassBody((declarationPath as NodePath<types.ClassDeclaration>).get("body"), internal);
      }
    }
  }
}

export function meshFunction(
  path: NodePath<
    | types.ArrowFunctionExpression
    | types.FunctionExpression
    | types.FunctionDeclaration
    | types.ObjectMethod
    | types.ClassMethod
    | types.ClassPrivateMethod
  >,
  internal: Internal,
) {
  if (t.isFunctionDeclaration(path.node) && path.node.id) {
    internal.stack.set(path.node.id.name, VariableState.Ignored);
  }

  internal.stack.push();

  const node = path.node;

  if (t.isFunctionExpression(node) && node.id) {
    internal.stack.set(node.id.name, VariableState.Ignored);
  }

  for (const param of node.params) {
    ignoreParams(param, internal);
  }
  if (t.isExpression(node.body)) {
    meshExpression(path.get("body") as NodePath<types.Expression>, internal);
  } else {
    const bodyPath = path.get("body") as NodePath<types.BlockStatement>;

    meshStatement(bodyPath, internal);
  }

  internal.stack.pop();
}

export function composeExpression(
  path: NodePath<types.Expression | null | undefined>,
  internal: Internal,
  isRoot?: boolean,
) {
  const expr = path.node;

  switch (expr && expr.type) {
    case "AssignmentExpression": {
      meshExpression(path, internal);
      break;
    }
    case "CallExpression":
    case "OptionalCallExpression": {
      if (calls(path, ["watch"], internal)) {
        const args = parseCalculateCall(path, internal);

        /* istanbul ignore else */
        if (args) {
          if (args[1].elements.length > 0) {
            path.replaceWith(
              t.callExpression(
                internal.stateOnly
                  ? t.memberExpression(internal.id, t.identifier("ex"))
                  : t.memberExpression(ctx, t.identifier("watch")),
                args,
              ),
            );
          } else {
            path.replaceWith(t.callExpression(args[0], []));
          }
        }
      } else {
        meshExpression(path, internal);
      }
      break;
    }
    case "LogicalExpression":
      composeExpression((path as NodePath<types.LogicalExpression>).get("left"), internal);
      composeExpression((path as NodePath<types.LogicalExpression>).get("right"), internal);
      break;
    case "ConditionalExpression":
      meshExpression((path as NodePath<types.ConditionalExpression>).get("test"), internal);
      composeExpression((path as NodePath<types.ConditionalExpression>).get("consequent"), internal);
      composeExpression((path as NodePath<types.ConditionalExpression>).get("alternate"), internal);
      break;
    case "JSXElement":
    case "JSXFragment":
      if (internal.stateOnly) {
        throw path.buildCodeFrameError("Vasille: JSX is not allowed in states");
      }
      path.replaceWithMultiple(transformJsx(path as NodePath<types.JSXElement | types.JSXFragment>, internal));
      break;
    default:
      meshExpression(path, internal, isRoot);
  }
}

export function composeStatements(
  paths: NodePath<types.Statement | null | undefined>[],
  internal: Internal,
  isRoot?: boolean,
) {
  for (const path of paths) {
    composeStatement(path, internal, isRoot);
  }
}

export function composeStatement(
  path: NodePath<types.Statement | null | undefined>,
  internal: Internal,
  isRoot?: boolean,
) {
  const statement = path.node;

  if (!statement) {
    return;
  }

  switch (statement.type) {
    case "FunctionDeclaration": {
      meshFunction(path as NodePath<types.FunctionDeclaration>, internal);
      break;
    }
    case "BlockStatement": {
      internal.stack.push();
      composeStatements((path as NodePath<types.BlockStatement>).get("body"), internal, isRoot);
      internal.stack.pop();
      break;
    }
    case "DoWhileStatement": {
      const _path = path as NodePath<types.DoWhileStatement>;

      meshExpression(_path.get("test"), internal);
      internal.stack.push();
      composeStatement(_path.get("body"), internal);
      internal.stack.pop();
      break;
    }
    case "ExpressionStatement": {
      composeExpression((path as NodePath<types.ExpressionStatement>).get("expression"), internal);
      break;
    }
    case "ForInStatement": {
      const _path = path as NodePath<types.ForInStatement>;

      internal.stack.push();
      meshForEachHeader(_path, internal);
      composeStatement(_path.get("body"), internal);
      internal.stack.pop();
      break;
    }
    case "ForStatement": {
      const _path = path as NodePath<types.ForStatement>;

      internal.stack.push();
      meshForHeader(_path, internal);
      composeStatement(_path.get("body"), internal);
      internal.stack.pop();
      break;
    }
    case "IfStatement": {
      const _path = path as NodePath<types.IfStatement>;

      meshExpression(_path.get("test"), internal);
      internal.stack.push();
      composeStatement(_path.get("consequent"), internal);
      internal.stack.pop();
      internal.stack.push();
      composeStatement(_path.get("alternate"), internal);
      internal.stack.pop();
      break;
    }
    case "LabeledStatement":
      composeStatement((path as NodePath<types.LabeledStatement>).get("body"), internal);
      break;

    case "ReturnStatement":
      composeExpression((path as NodePath<types.ReturnStatement>).get("argument"), internal, isRoot);
      break;

    case "SwitchStatement": {
      const _path = path as NodePath<types.SwitchStatement>;

      meshExpression(_path.get("discriminant"), internal);
      internal.stack.push();
      for (const _case of _path.get("cases")) {
        meshExpression(_case.get("test"), internal);
        composeStatements(_case.get("consequent"), internal);
      }
      internal.stack.pop();
      break;
    }
    case "TryStatement":
      const tryHandler = (path as NodePath<types.TryStatement>).get("handler");

      composeStatement((path as NodePath<types.TryStatement>).get("block"), internal);
      tryHandler.node && composeStatement((tryHandler as NodePath<types.CatchClause>).get("body"), internal);
      composeStatement((path as NodePath<types.TryStatement>).get("finalizer"), internal);
      break;

    case "VariableDeclaration": {
      const _path = path as NodePath<types.VariableDeclaration>;
      const kind = _path.node.kind;
      const declares = kind === "const" ? VariableState.Ignored : VariableState.Reactive;
      let switchToConst = true;

      for (const declaration of _path.get("declarations")) {
        const id = declaration.node.id;
        const bridgeMethod = processBridgeCall(declaration.get("init"), internal);
        let meshInit = true;

        function idName(target: types.LVal | types.PatternLike | null = id): string {
          let name = "#";

          /* istanbul ignore else */
          if (t.isIdentifier(target)) {
            name = target.name;
          }

          return name;
        }

        function idDoubleName(): [string, string] {
          const pattern = id as types.ArrayPattern;

          return [idName(pattern.elements[0]), idName(pattern.elements[1])];
        }

        ignoreParams(declaration.node.id, internal);

        /* istanbul ignore else */
        if (bridgeMethod === "value" && declares === VariableState.Reactive && t.isIdentifier(declaration.node.id)) {
          switchToConst = true;
          meshInit = false;
          internal.stack.set(declaration.node.id.name, VariableState.Reactive);
          declaration.get("init").replaceWith(ref(declaration.node.init, internal, declaration.node.id.name));
        } else if (bridgeMethod) {
          switchToConst = false;
          meshInit = false;
        } else if (calls(declaration.get("init"), ["awaited"], internal)) {
          reactiveArrayPattern(declaration.get("id"), internal);
          meshAllUnknown((declaration.get("init") as NodePath<types.CallExpression>).get("arguments"), internal);
          named(declaration.node.init as types.CallExpression, idDoubleName(), internal);
          meshInit = false;
        } else if (t.isIdentifier(id)) {
          internal.stack.set(id.name, declares);

          const init = declaration.node.init;
          const initPath = declaration.get("init");
          let callName: string | false = false;

          if (calls(initPath, ["value"], internal)) {
            internal.stack.set(id.name, VariableState.Ignored);
            declaration.get("init").replaceWith((init as types.CallExpression).arguments[0]);
            _path.node.kind = kind;
            switchToConst = false;
          } else if (calls(initPath, ["bind"], internal)) {
            const argument = (init as types.CallExpression).arguments[0] as types.Expression;
            const argumentPath = (declaration.get("init") as NodePath<types.CallExpression>).get(
              "arguments",
            )[0] as NodePath<types.Expression>;
            let replaceWith =
              declares === VariableState.Reactive
                ? forwardOnlyExpr(argumentPath, argument, internal)
                : exprCall(argumentPath, argument, internal, idName());
            if (!replaceWith) {
              replaceWith =
                declares === VariableState.Reactive
                  ? t.callExpression(t.memberExpression(internal.id, t.identifier("r")), [argument])
                  : ref(argument, internal, idName());
            }

            if (declares === VariableState.Reactive) {
              internal.stack.set(id.name, VariableState.ReactivePointer);
              replaceWith = own(replaceWith, internal, idName());
            } else {
              internal.stack.set(id.name, VariableState.Reactive);
            }

            declaration.get("init").replaceWith(replaceWith);
            meshInit = !replaceWith;
          } else if (calls(initPath, ["ref"], internal)) {
            const argument = (init as types.CallExpression).arguments[0];

            internal.stack.set(id.name, VariableState.Reactive);
            declaration.get("init").replaceWith(ref(t.isExpression(argument) ? argument : null, internal, idName()));
          } else if (calls(initPath, ["reactiveObject"], internal)) {
            const value = (init as types.CallExpression).arguments[0];

            if (kind !== "const") {
              throw declaration.buildCodeFrameError(`Vasille: Reactive objects must be must be declared as constants`);
            }
            if (t.isObjectExpression(value)) {
              declaration.get("init").replaceWith(reactiveObject(value, internal, idName()));
              internal.stack.set(id.name, VariableState.ReactiveObject);
            } else {
              throw declaration.buildCodeFrameError(`Vasille: reactiveObject requires object expression as argument`);
            }
          } else if (calls(initPath, ["arrayModel"], internal)) {
            const value = (init as types.CallExpression).arguments[0];

            if (kind !== "const") {
              throw declaration.buildCodeFrameError(`Vasille: Array models must be must be declared as constants`);
            }
            if (t.isArrayExpression(value)) {
              declaration.get("init").replaceWith(arrayModel(value, internal, idName()));
            } else {
              declaration.get("init").replaceWith(arrayModel(null, internal, idName()));
            }
          } else if ((callName = calls(initPath, ["mapModel", "setModel"], internal))) {
            const args = (init as types.CallExpression).arguments;

            if (kind !== "const") {
              throw declaration.buildCodeFrameError(
                `Vasille: ${callName === "mapModel" ? "Map" : "Set"} models must be declared as constants`,
              );
            }
            declaration
              .get("init")
              .replaceWith(
                callName === "mapModel" ? mapModel(args, internal, idName()) : setModel(args, internal, idName()),
              );
          } else if (t.isObjectExpression(init)) {
            if (kind !== "const") {
              throw declaration.buildCodeFrameError(`Vasille: Objects must be must be declared as constants`);
            }
            declaration.get("init").replaceWith(reactiveObject(init, internal, idName()));
            internal.stack.set(id.name, VariableState.ReactiveObject);
          } else if (t.isArrayExpression(init)) {
            if (kind !== "const") {
              throw declaration.buildCodeFrameError(`Vasille: Arrays must be must be declared as constants`);
            }
            declaration.get("init").replaceWith(arrayModel(init, internal, idName()));
          } else if (t.isNewExpression(init) && t.isIdentifier(init.callee)) {
            if (init.callee.name === "Map" || init.callee.name === "Set") {
              if (kind !== "const") {
                throw declaration.buildCodeFrameError(
                  `Vasille: ${init.callee.name === "Map" ? "Maps" : "Sets"} must be declared as constants`,
                );
              }
              declaration
                .get("init")
                .replaceWith(
                  init.callee.name === "Map"
                    ? mapModel(init.arguments, internal, idName())
                    : setModel(init.arguments, internal, idName()),
                );
            }
          } else if (declares === VariableState.Reactive) {
            const replaceWith = forwardOnlyExpr(declaration.get("init"), declaration.node.init, internal);

            meshInit = !replaceWith;
            internal.stack.set(id.name, replaceWith ? VariableState.ReactivePointer : VariableState.Reactive);
            declaration
              .get("init")
              .replaceWith(
                replaceWith ? own(replaceWith, internal, idName()) : ref(declaration.node.init, internal, idName()),
              );
          } else {
            const replaceWith = exprCall(declaration.get("init"), declaration.node.init, internal, idName());

            if (replaceWith) {
              declaration.get("init").replaceWith(replaceWith);
            }
            internal.stack.set(
              id.name,
              replaceWith
                ? VariableState.Reactive
                : nodeIsReactiveObject(declaration.get("init"), internal)
                  ? VariableState.ReactiveObject
                  : VariableState.Ignored,
            );
            meshInit = !replaceWith;
          }
        } else if (t.isObjectPattern(id)) {
          for (const prop of id.properties) {
            /* istanbul ignore else */
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.value)) {
              internal.stack.set(prop.value.name, VariableState.Reactive);
            } else if (t.isRestElement(prop) && t.isIdentifier(prop.argument)) {
              internal.stack.set(prop.argument.name, VariableState.ReactiveObject);
            }
          }
        }
        if (meshInit) {
          meshExpression(declaration.get("init"), internal);
        }
      }
      if (switchToConst && (kind === "let" || kind === "var")) {
        _path.node.kind = "const";
      }
      break;
    }
    case "WhileStatement": {
      const _path = path as NodePath<types.WhileStatement>;

      meshExpression(_path.get("test"), internal);
      internal.stack.push();
      composeStatement(_path.get("body"), internal);
      internal.stack.pop();
      break;
    }
    case "ForOfStatement": {
      const _path = path as NodePath<types.ForOfStatement>;

      internal.stack.push();
      meshForEachHeader(_path, internal);
      composeStatement(_path.get("body"), internal);
      internal.stack.pop();
      break;
    }
    default:
      meshStatement(path, internal);
  }
}

export function compose(
  path: NodePath<types.ArrowFunctionExpression | types.FunctionExpression | types.FunctionDeclaration>,
  internal: Internal,
  isInternalSlot: boolean,
  composeMethod: ComposeMethods,
) {
  internal.stack.push();

  const node = path.node;
  const params = node.params;
  const body = node.body;
  const argsNumber = composeArgsNumber[composeMethod];

  if (t.isFunctionExpression(node) && node.id) {
    internal.stack.set(node.id.name, VariableState.Ignored);
  }

  if (params.length > argsNumber && !isInternalSlot) {
    throw path.get("params")[argsNumber].buildCodeFrameError("Vasille: Extra parameters are not allowed");
  }

  const cumulativeFields = new Set<string>();
  const nonPropsFields: string[] = [];
  let index = 0;

  for (const param of path.get("params")) {
    const node = param.node;
    const isProps = index === composePropsIndex[composeMethod];

    if (t.isAssignmentPattern(node)) {
      throw param.buildCodeFrameError("Vasille: No default value allowed here");
    }

    if (argsNumber !== 1) {
      if (t.isObjectPattern(node)) {
        for (const prop of node.properties) {
          if (t.isObjectProperty(prop)) {
            const name = stringify(prop.key);

            if (cumulativeFields.has(name)) {
              throw param.buildCodeFrameError(`Vasille: Field "${name}" is defined twice`);
            }
            cumulativeFields.add(name);

            if (!isProps) {
              nonPropsFields.push(name);
            }
          } else {
            throw param.buildCodeFrameError("Vasille: Rest element is not supported here");
          }
        }
      }
    }

    if (t.isIdentifier(node) && argsNumber === 1) {
      internal.stack.set(node.name, isInternalSlot || !isProps ? VariableState.Ignored : VariableState.ReactiveObject);
    } else if ((isInternalSlot || !isProps) && t.isObjectPattern(node)) {
      ignoreObjectPattern(node, internal);
    } else if (t.isObjectPattern(node)) {
      for (const prop of (param as NodePath<types.ObjectPattern>).get("properties")) {
        const node = prop.node;

        if (t.isObjectProperty(node)) {
          const key = node.key;
          let keyName: string = "";

          /* istanbul ignore else */
          if (t.isIdentifier(node.value)) {
            keyName = node.value.name;
          } else if (t.isIdentifier(key) && !node.computed) {
            keyName = key.name;
          }

          internal.stack.set(keyName, VariableState.Reactive);

          if (t.isAssignmentPattern(node.value)) {
            const assignPath = (prop as NodePath<types.ObjectProperty>).get(
              "value",
            ) as NodePath<types.AssignmentPattern>;

            assignPath
              .get("right")
              .replaceWith(
                t.callExpression(t.memberExpression(internal.id, t.identifier("r")), [assignPath.node.right]),
              );
          } else if (!t.isIdentifier(node.value)) {
            throw prop.buildCodeFrameError("Vasille: Value decomposition is not allowed here");
          }
        }
        if (t.isRestElement(node)) {
          internal.stack.set((node.argument as types.Identifier).name, VariableState.ReactiveObject);
        }
      }
    } else {
      throw param.buildCodeFrameError(
        argsNumber === 1 ? "Vasille: Expected identifier or object pattern" : "Vasille: Expected object pattern here",
      );
    }
    index++;
  }

  if (argsNumber !== 1) {
    node.params = [
      t.objectPattern([
        ...(params[0] as types.ObjectPattern).properties,
        ...(params[1] as types.ObjectPattern).properties,
      ]),
    ];
  }

  internal.isComposing = true;

  /* istanbul ignore else */
  if (t.isExpression(body)) {
    composeExpression(path.get("body") as NodePath<types.Expression>, internal, true);
  } else if (t.isBlockStatement(body)) {
    composeStatement(path.get("body") as NodePath<types.BlockStatement>, internal, true);
  }

  internal.isComposing = false;

  internal.stack.pop();

  return nonPropsFields;
}
