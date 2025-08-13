import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { calls, composeOnly, styleOnly } from "./call.js";
import { checkNode, idIsIValue, memberIsIValue, nodeIsReactiveObject } from "./expression.js";
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
  ref,
  setModel,
} from "./lib.js";
import { routerReplace } from "./router";
import { stringify } from "./utils";

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
  internal: Internal,
) {
  const arg = call.arguments[0];

  if (call.arguments.length !== 1 || !(t.isFunctionExpression(arg) || t.isArrowFunctionExpression(arg))) {
    throw nodePath.buildCodeFrameError("Vasille: Invalid arguments");
  }

  const fnPath = (nodePath as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<
    types.FunctionExpression | types.ArrowFunctionExpression
  >;

  compose(fnPath, internal, false);

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

export function meshLValue(
  path: NodePath<types.LVal | types.Expression | types.VoidPattern | null | undefined>,
  internal: Internal,
) {
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

export function meshExpression(nodePath: NodePath<types.Expression | null | undefined>, internal: Internal) {
  const expr = nodePath.node;

  if (!expr) {
    return;
  }

  if (calls(nodePath, ["compose", "store", "view"], internal)) {
    meshComposeCall(expr as types.CallExpression, null, nodePath, internal);

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
      if (idIsIValue(nodePath as NodePath<types.Identifier>, internal)) {
        nodePath.replaceWith(t.memberExpression(expr, t.identifier("V")));
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

        meshOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), internal);
        meshAllUnknown(path.get("arguments"), internal);
      }

      break;
    }
    case "AssignmentExpression": {
      const path = nodePath as NodePath<types.AssignmentExpression>;
      const left = path.node.left;
      let replaced = false;

      meshLValue(path.get("left"), internal);

      if (t.isIdentifier(left) && left.name.startsWith("$")) {
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
      processObjectExpression(nodePath as NodePath<types.ObjectExpression>, internal);
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

export function ignoreParams(path: NodePath<types.LVal | types.VoidPattern | null | undefined>, internal: Internal) {
  const val = path.node;

  /* istanbul ignore else */
  if (t.isAssignmentPattern(val)) {
    meshExpression((path as NodePath<types.AssignmentPattern>).get("right"), internal);
    ignoreParams((path as NodePath<types.AssignmentPattern>).get("left"), internal);
  } else if (t.isIdentifier(val)) {
    internal.stack.set(val.name, {});
  } else if (t.isObjectPattern(val)) {
    ignoreObjectPattern(path as NodePath<types.ObjectPattern>, internal);
  } else if (t.isArrayPattern(val)) {
    for (const element of (path as NodePath<types.ArrayPattern>).get("elements")) {
      if (element) {
        ignoreParams(element, internal);
      }
    }
  } else if (t.isRestElement(val)) {
    ignoreParams((path as NodePath<types.RestElement>).get("argument"), internal);
  } else {
    meshLValue(path, internal);
  }
}

function ignoreObjectPattern(pattern: NodePath<types.ObjectPattern>, internal: Internal) {
  for (const path of pattern.get("properties")) {
    const property = path.node;

    if (t.isObjectProperty(property)) {
      const originName =
        (t.isStringLiteral(property.key) && property.key.value) ||
        (!property.computed && t.isIdentifier(property.key) && property.key.name);
      const newName =
        (t.isStringLiteral(property.value) && property.value.value) ||
        (t.isIdentifier(property.value) && property.value.name) ||
        (t.isAssignmentPattern(property.value) && t.isIdentifier(property.value.left) && property.value.left.name);

      if (originName && newName && originName.startsWith("$") !== newName.startsWith("$")) {
        throw path
          .get("value")
          .buildCodeFrameError(
            `Vasille: Property "${originName}" can not be renamed to "${newName}": ` +
              (originName.startsWith("$")
                ? `rename it to "$${newName}"`
                : `rename it to "${newName.substring(1)}"`),
          );
      }

      /* istanbul ignore else */
      if (t.isObjectPattern(property.value)) {
        if (originName && originName.startsWith("$")) {
          throw path.get("value").buildCodeFrameError("Vasille: You can not destruct a reactive value");
        }

        ignoreObjectPattern(path.get("value") as NodePath<types.ObjectPattern>, internal);
      } else if (t.isAssignmentPattern(property.value)) {
        const right = (path.get("value") as NodePath<types.AssignmentPattern>).get("right");

        ignoreParams((path.get("value") as NodePath<types.AssignmentPattern>).get("left"), internal);
        meshExpression(right, internal);

        if (property.computed && t.isIdentifier(property.key)) {
          right.replaceWith(internal.match(t.stringLiteral(property.key.name), right.node));
        } else if (
          (t.isIdentifier(property.key) && property.key.name.startsWith("$")) ||
          (t.isStringLiteral(property.key) && property.key.value.startsWith("$"))
        ) {
          right.replaceWith(internal.ref(right.node));
        }
      } else if (t.isIdentifier(property.value)) {
        internal.stack.set(property.value.name, {});

        if (property.computed) {
          path
            .get("value")
            .replaceWith(t.assignmentPattern(property.value, internal.match(t.stringLiteral(property.value.name))));
        } else if (property.value.name.startsWith("$")) {
          path.get("value").replaceWith(t.assignmentPattern(property.value, internal.ref()));
        }
      }
    }
    if (t.isRestElement(property) && t.isIdentifier(property.argument)) {
      internal.stack.set(property.argument.name, {});
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
        if (index < 2 && !element.name.startsWith("$")) {
          throw path.buildCodeFrameError("Vasille: Reactive variable name must start with $");
        }
        internal.stack.set(element.name, {});
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
    ignoreParams(path.get("left").get("declarations")[0].get("id"), internal);
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
        ignoreParams(declarationPath.get("id"), internal);
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

function procedureProcessObjectExpression(
  path: NodePath<types.ObjectExpression>,
  internal: Internal,
  state: VariableState,
  prefix: string,
): VariableState {
  for (const prop of path.get("properties")) {
    /* istanbul ignore else */
    if (t.isObjectProperty(prop.node)) {
      // the property name is known in compile time
      if (
        (!prop.node.computed || t.isStringLiteral(prop.node.key)) &&
        (t.isIdentifier(prop.node.key) || t.isStringLiteral(prop.node.key)) &&
        t.isExpression(prop.node.value)
      ) {
        const call = checkNode(prop.get("value") as NodePath<types.Expression>, internal);
        const name = stringify(prop.node.key);

        if (call.found.size > 0) {
          throw prop.get("value").buildCodeFrameError("Vasille: Objects can not contains bind expressions");
        } else if (call.self) {
          if (name.startsWith("$")) {
            throw prop.get("key").buildCodeFrameError("Vasille: Reactive field name must start with $");
          }
          state[name] = 1;
        } else {
          if (t.isObjectExpression(prop.node.value)) {
            procedureProcessObjectExpression(
              prop.get("value") as NodePath<types.ObjectExpression>,
              internal,
              state,
              `${prefix}${name}.`,
            );
          } else {
            meshExpression(prop.get("value") as NodePath<types.Expression>, internal);
          }

          if (name.startsWith("$")) {
            if (internal.isComposing && !internal.isFunctionParsing) {
              prop.get("value").replaceWith(internal.ref(prop.node.value));
              state[name] = 1;
            } else {
              throw prop.get("key").buildCodeFrameError("Vasille: This property is not a reactive");
            }
          }
        }
      }
      // the property name is unknown in compile time
      else {
        meshOrIgnoreExpression<types.PrivateName>(prop.get("key"), internal);
        meshLValue((prop as NodePath<types.ObjectProperty>).get("value"), internal);
        /* istanbul ignore else */
        if (!t.isPrivateName(prop.node.key) && t.isExpression(prop.node.value)) {
          prop.get("value").replaceWith(internal.match(prop.node.key, prop.node.value));
        }
      }
    } else if (t.isObjectMethod(prop.node)) {
      if (
        (t.isIdentifier(prop.node.key) && prop.node.key.name.startsWith("$") && !prop.node.computed) ||
        (t.isStringLiteral(prop.node.key) && prop.node.key.value.startsWith("$"))
      ) {
        throw prop.get("key").buildCodeFrameError("Vasille: Method name can not start with $");
      }
    } else if (t.isSpreadElement(prop.node)) {
      const argumentPath = (prop as NodePath<types.SpreadElement>).get("argument");

      if (t.isObjectExpression(prop.node.argument)) {
        procedureProcessObjectExpression(argumentPath as NodePath<types.ObjectExpression>, internal, state, prefix);
      } else {
        meshExpression(argumentPath, internal);
      }
    }
  }

  return state;
}

export function processObjectExpression(path: NodePath<types.ObjectExpression>, internal: Internal): VariableState {
  return procedureProcessObjectExpression(path, internal, {}, "");
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
        const composeMethod = calls(initPath, ["compose", "store", "view", "screen"], internal);

        if (expr && t.isIdentifier(declaration.node.id) && composeMethod) {
          meshComposeCall(expr as types.CallExpression, declaration.node.id, declaration.get("init"), internal);
        } else {
          meshExpression(declaration.get("init"), internal);
          ignoreParams(declaration.get("id"), internal);
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
    internal.stack.set(path.node.id.name, {});
  }

  internal.stack.push();

  const node = path.node;

  if (t.isFunctionExpression(node) && node.id) {
    internal.stack.set(node.id.name, {});
  }

  for (const param of path.get("params")) {
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

export function composeExpression(path: NodePath<types.Expression | null | undefined>, internal: Internal) {
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
            path.replaceWith(internal.expr(...args));
          } else {
            path.replaceWith(t.callExpression(args[0], []));
          }
        }
      } else if (calls(path, ["runOnDestroy"], internal)) {
        if (internal.stateOnly) {
          throw path.buildCodeFrameError("Vasille: Stores in Vasille.JS are not destroyable");
        }

        path.get("callee").replaceWith(t.memberExpression(ctx, t.identifier("runOnDestroy")));
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
      meshExpression(path, internal);
  }
}

export function composeStatements(paths: NodePath<types.Statement | null | undefined>[], internal: Internal) {
  for (const path of paths) {
    composeStatement(path, internal);
  }
}

export function composeStatement(path: NodePath<types.Statement | null | undefined>, internal: Internal) {
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
      composeStatements((path as NodePath<types.BlockStatement>).get("body"), internal);
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
      composeExpression((path as NodePath<types.ReturnStatement>).get("argument"), internal);
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
      let switchToConst = true;

      for (const declaration of _path.get("declarations")) {
        const id = declaration.node.id;
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

        ignoreParams(declaration.get("id"), internal);

        /* istanbul ignore else */
        if (calls(declaration.get("init"), ["awaited"], internal)) {
          reactiveArrayPattern(declaration.get("id"), internal);
          meshAllUnknown((declaration.get("init") as NodePath<types.CallExpression>).get("arguments"), internal);
          named(declaration.node.init as types.CallExpression, idDoubleName(), internal);
          meshInit = false;
        } else if (t.isIdentifier(id)) {
          const idPath = declaration.get("id") as NodePath<types.Identifier>;

          const checkReactiveName = () => {
            if (!id.name.startsWith("$")) {
              throw idPath.buildCodeFrameError("Vasille: Reactive variable name must start with $");
            }
          };
          const checkNonReactiveName = () => {
            if (!id.name.startsWith("$")) {
              throw idPath.buildCodeFrameError("Vasille: Non-reactive variable name must not start with $");
            }
          };

          internal.stack.set(id.name, {});

          if (kind === "let") {
            checkReactiveName();
          }

          const init = declaration.node.init;
          const initPath = declaration.get("init");
          let callName: string | false = false;

          // let a = raw(0)
          if (calls(initPath, ["raw"], internal)) {
            declaration.get("init").replaceWith((init as types.CallExpression).arguments[0]);
            _path.node.kind = kind;
            switchToConst = false;
          }
          // const x = bind(a + b);
          else if (calls(initPath, ["bind"], internal)) {
            const argument = (init as types.CallExpression).arguments[0] as types.Expression;
            const argumentPath = (declaration.get("init") as NodePath<types.CallExpression>).get(
              "arguments",
            )[0] as NodePath<types.Expression>;
            let replaceWith = exprCall(argumentPath, argument, internal, idName());

            meshInit = !replaceWith;

            if (!replaceWith) {
              replaceWith = ref(argument, internal, idName());
            }

            declaration.get("init").replaceWith(replaceWith);
            checkReactiveName();
          }
          // let y = ref(2)
          else if (calls(initPath, ["ref"], internal)) {
            const argument = (init as types.CallExpression).arguments[0];

            declaration.get("init").replaceWith(ref(t.isExpression(argument) ? argument : null, internal, idName()));
          }
          // const arr = arrayModel()
          else if (calls(initPath, ["arrayModel"], internal)) {
            const value = (init as types.CallExpression).arguments[0];

            if (kind !== "const") {
              throw declaration.buildCodeFrameError(`Vasille: Array models must be must be declared as constants`);
            }
            if (t.isArrayExpression(value)) {
              declaration.get("init").replaceWith(arrayModel(value, internal, idName()));
            } else {
              declaration.get("init").replaceWith(arrayModel(null, internal, idName()));
            }
            checkNonReactiveName();
          }
          // const map = mapModel();
          else if ((callName = calls(initPath, ["mapModel", "setModel"], internal))) {
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
            checkNonReactiveName();
          }
          // const x = { .. }
          else if (t.isObjectExpression(init)) {
            internal.stack.set(
              id.name,
              processObjectExpression(initPath as NodePath<types.ObjectExpression>, internal),
            );
            meshInit = false;
          }
          // const a = []
          else if (t.isArrayExpression(init)) {
            if (kind !== "const") {
              throw declaration.buildCodeFrameError(`Vasille: Arrays must be must be declared as constants`);
            }
            declaration.get("init").replaceWith(arrayModel(init, internal, idName()));
          }
          // const s = new Set(), const m = new Map()
          else if (t.isNewExpression(init) && t.isIdentifier(init.callee)) {
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
          } else if (kind === "let") {
            const replaceWith = forwardOnlyExpr(declaration.get("init"), declaration.node.init, internal);

            meshInit = !replaceWith;
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
            meshInit = !replaceWith;
          }
        } else if (t.isObjectPattern(id)) {
          ignoreObjectPattern(declaration.get("id") as NodePath<types.ObjectPattern>, internal);
        }
        if (meshInit) {
          meshExpression(declaration.get("init"), internal);
        }
      }
      if (switchToConst && kind === "let") {
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
) {
  internal.stack.push();

  const node = path.node;
  const params = node.params;
  const body = node.body;

  if (t.isFunctionExpression(node) && node.id) {
    internal.stack.set(node.id.name, {});
  }

  if (params.length > 1 && !isInternalSlot) {
    throw path.get("params")[1].buildCodeFrameError("Vasille: Extra parameters are not allowed");
  }

  for (const param of path.get("params")) {
    ignoreParams(param, internal);
  }

  internal.isComposing = true;

  /* istanbul ignore else */
  if (t.isExpression(body)) {
    composeExpression(path.get("body") as NodePath<types.Expression>, internal);
  } else if (t.isBlockStatement(body)) {
    composeStatement(path.get("body") as NodePath<types.BlockStatement>, internal);
  }

  internal.isComposing = false;

  internal.stack.pop();
}
