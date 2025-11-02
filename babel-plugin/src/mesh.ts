import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { calls, composeFunctions, hintFunctions, modelFunctions, reactivityFunctions } from "./call.js";
import { checkNode, exprIsSure, idIsIValue, memberIsIValue } from "./expression.js";
import { ctx, Internal, VariableState } from "./internal.js";
import { ConditionCollection, processConditions, transformJsx } from "./jsx.js";
import {
  arrayModel,
  checkNonReactiveName,
  checkReactiveName,
  err,
  Errors,
  exprCall,
  named,
  parseCalculateCall,
  processCalculateCall,
  processModelCall,
  ref,
} from "./lib.js";
import { checkOrder } from "./order-check";
import { routerReplace } from "./router";
import { stringify } from "./utils";

export function meshOrIgnoreAllExpressions<T extends types.Node>(
  nodePaths: NodePath<types.Expression | null | T>[],
  internal: Internal,
) {
  for (const path of nodePaths) {
    /* istanbul ignore else */
    if (path.isExpression()) {
      meshExpression(path, internal);
    }
  }
}

export function meshAllExpressions(nodePaths: NodePath<types.Expression | null>[], internal: Internal) {
  for (const path of nodePaths) {
    meshExpression(path, internal);
  }
}

export function meshComposeCall(
  name: string | null | undefined,
  path: NodePath<types.Node | null | undefined>,
  internal: Internal,
) {
  const args = path.isCallExpression() && path.get("arguments");
  const arg = args && (args[0].isFunctionExpression() || args[0].isArrowFunctionExpression()) && args[0];

  if (!args || !arg || args.length !== 1) {
    return err(Errors.IncorrectArguments, path, "Invalid arguments number", internal);
  }

  compose(arg, internal, false, false);
  arg.node.params.unshift(ctx);

  if (internal.devMode && path.isCallExpression()) {
    path.node.arguments.push(t.stringLiteral(name ? name : "#"));
  }
}

export function meshAllUnknown(
  paths: NodePath<types.SpreadElement | types.ArgumentPlaceholder | types.Expression | null>[],
  internal: Internal,
) {
  for (const path of paths) {
    /* istanbul ignore else */
    if (path.isSpreadElement()) {
      meshExpression(path.get("argument"), internal);
    } else if (path.isExpression()) {
      meshExpression(path, internal);
    }
  }
}

export function meshLValue(
  path: NodePath<types.LVal | types.Expression | types.VoidPattern | null | undefined>,
  internal: Internal,
) {
  /* istanbul ignore else */
  if (path.isExpression() || path.isIdentifier()) {
    meshExpression(path, internal);
  }
}

export function meshOrIgnoreExpression<T extends types.Node>(
  path: NodePath<types.Expression | types.VoidPattern | null | undefined | T>,
  internal: Internal,
) {
  /* istanbul ignore else */
  if (path.isExpression()) {
    meshExpression(path, internal);
  }
}

export function meshExpression(nodePath: NodePath<types.Expression | null | undefined>, internal: Internal) {
  const expr = nodePath.node;

  if (!expr) {
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
      if (idIsIValue(nodePath as NodePath<types.Identifier>)) {
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
      const path = nodePath;
      const argPath = path.get("arguments")[0];

      // compose call
      if (!internal.isComposing && calls(nodePath, ["page"], internal)) {
        const firstArg = nodePath.node.typeParameters?.params[0];
        const string = t.isTSLiteralType(firstArg) && t.isStringLiteral(firstArg.literal) && firstArg.literal.value;

        if (string && !internal.filename.replace(/\.[tj]sx?$/, "").endsWith(string)) {
          err(
            Errors.RulesOfVasille,
            nodePath.get("typeParameters"),
            "Page path does not match the file path",
            internal,
          );
        }
        meshComposeCall(null, nodePath, internal);
      } else if (!internal.isComposing && calls(nodePath, composeFunctions, internal)) {
        meshComposeCall(null, nodePath, internal);
      }
      // raw call
      else if (calls(path, ["raw"], internal)) {
        if (argPath && argPath.isExpression()) {
          meshExpression(argPath, internal);
          path.replaceWith(argPath);
        } else {
          err(Errors.IncorrectArguments, argPath ?? path, "Failed to parse raw value", internal);
        }
      }
      // arrayModel/setModel/mapModel call
      else if (!internal.isComposing && calls(path, modelFunctions, internal)) {
        /* istanbul ignore else */
        if (argPath) {
          meshAllUnknown([argPath], internal);
        }
        path.node.arguments.unshift(t.nullLiteral());
      }
      // router call
      else if (internal.isComposing && calls(path, ["router"], internal)) {
        if (!internal.stateOnly) {
          routerReplace(path);
        } else {
          err(Errors.IncompatibleContext, path, "The router is not available in stores", internal);
        }
      }
      // watch call
      else if (calls(path, ["watch"], internal)) {
        processCalculateCall(path, internal);
      } else if (
        path.isCallExpression() &&
        t.isIdentifier(path.node.callee) &&
        path.node.callee.name.startsWith("prompt")
      ) {
        if (!internal.isComposing) {
          err(Errors.IncompatibleContext, path, "Prompts can be constructed only from components", internal);
        }
        path.node.arguments.unshift(ctx);
      }
      // call any other function, invalid if code calls a hint
      else {
        if (calls(path, hintFunctions, internal)) {
          err(Errors.IncompatibleContext, path, `Usage of hints is restricted here`, internal);
        }

        meshOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), internal);
        meshAllUnknown(path.get("arguments"), internal);
      }

      break;
    }
    case "AssignmentExpression": {
      const path = nodePath as NodePath<types.AssignmentExpression>;
      const left = path.get("left");
      const right = path.get("right");

      if (left.isMemberExpression() && !exprIsSure(left, internal)) {
        const property = left.node.property;
        let iterator: NodePath<unknown> = path;
        let inConstructor = false,
          inFunction = false;

        while (iterator && !inConstructor && !inFunction) {
          inConstructor =
            iterator.isClassMethod() && t.isIdentifier(iterator.node.key) && iterator.node.key.name === "constructor";
          inFunction = iterator.isFunction();
          iterator = iterator.parentPath;
        }

        if (
          !(
            inConstructor &&
            t.isIdentifier(property) &&
            property.name[0] === "$" &&
            t.isThisExpression(left.node.object) &&
            ((right.isIdentifier() && idIsIValue(right)) || (right.isMemberExpression() && memberIsIValue(right.node)))
          )
        ) {
          meshExpression(left.get("object"), internal);
          meshExpression(right, internal);

          /* istanbul ignore else */
          if (!t.isPrivateName(property)) {
            path.replaceWith(
              internal.set(
                left.node.object,
                !left.node.computed && t.isIdentifier(property) ? t.stringLiteral(property.name) : property,
                right.node,
              ),
            );
          }
        }
      } else {
        meshLValue(left, internal);
        meshExpression(right, internal);
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

      if (memberIsIValue(node)) {
        if (exprIsSure(path, internal)) {
          path.replaceWith(t.memberExpression(path.node, t.identifier("V")));
        } else {
          path.replaceWith(t.optionalMemberExpression(path.node, t.identifier("V"), false, true));
        }
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
      const classPath = nodePath as NodePath<types.ClassExpression>;
      const idPath = classPath.get("id");

      if (idPath.isIdentifier()) {
        checkNonReactiveName(idPath, internal);
      }
      meshClassBody(classPath.get("body"), internal);
      break;
    }
    case "JSXFragment": {
      err(Errors.IncompatibleContext, nodePath, "JSX fragment is not allowed here", internal);
      break;
    }
    case "JSXElement": {
      err(Errors.IncompatibleContext, nodePath, "JSX element is not allowed here", internal);
      break;
    }
  }
}

export function meshStatements(paths: NodePath<types.Statement>[], internal: Internal) {
  for (const path of paths) {
    meshStatement(path, internal);
  }
}

export function ignoreParams(
  path: NodePath<types.LVal | types.VoidPattern | null | undefined>,
  internal: Internal,
  allowReactiveId: false | ("id" | "array")[],
) {
  /* istanbul ignore else */
  // param with default value
  if (path.isAssignmentPattern()) {
    const left = path.get("left");

    meshExpression(path.get("right"), internal);
    ignoreParams(left, internal, false);

    /* istanbul ignore else */
    if (!allowReactiveId && left.isIdentifier()) {
      checkNonReactiveName(left, internal);
    }
  }
  // param is identifier
  else if (path.isIdentifier()) {
    internal.stack.set(path.node.name, {});
    if (!allowReactiveId || !allowReactiveId.includes("id")) {
      checkNonReactiveName(path, internal);
    }
  }
  // param is object destruction
  else if (path.isObjectPattern()) {
    ignoreObjectPattern(path, internal);
  }
  // param is array destruction
  else if (path.isArrayPattern()) {
    for (const element of path.get("elements")) {
      if (element) {
        ignoreParams(element, internal, allowReactiveId && allowReactiveId.includes("array") && ["id", "array"]);
        if ((!allowReactiveId || !allowReactiveId.includes("array")) && element.isIdentifier()) {
          checkNonReactiveName(element, internal);
        }
      }
    }
  }
  // rest element
  else if (path.isRestElement()) {
    ignoreParams(path.get("argument"), internal, false);
  }
  // something else
  else {
    meshLValue(path, internal);
  }
}

function ignoreObjectPattern(pattern: NodePath<types.ObjectPattern>, internal: Internal) {
  for (const path of pattern.get("properties")) {
    if (path.isObjectProperty()) {
      const property = path.node;
      const originName =
        (t.isStringLiteral(property.key) && property.key.value) ||
        (!property.computed && t.isIdentifier(property.key) && property.key.name);
      const newName =
        (t.isIdentifier(property.value) && property.value.name) ||
        (t.isAssignmentPattern(property.value) && t.isIdentifier(property.value.left) && property.value.left.name);

      if (originName && newName && originName.startsWith("$") !== newName.startsWith("$")) {
        err(
          Errors.RulesOfVasille,
          path.get("value"),
          `Property "${originName}" can not be renamed to "${newName}": ` +
            (originName.startsWith("$") ? `rename it to "$${newName}"` : `rename it to "${newName.substring(1)}"`),
          internal,
        );
      }

      const valuePath = path.get("value");

      /* istanbul ignore else */
      if (valuePath.isObjectPattern()) {
        /* istanbul ignore else */
        if (originName && originName.startsWith("$")) {
          err(Errors.RulesOfVasille, path, "You can not destruct a reactive value", internal);
        }

        ignoreObjectPattern(path.get("value") as NodePath<types.ObjectPattern>, internal);
      } else if (valuePath.isAssignmentPattern()) {
        const right = valuePath.get("right");

        ignoreParams(valuePath.get("left"), internal, ["id"]);
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
    if (path.isRestElement() && t.isIdentifier(path.node.argument)) {
      internal.stack.set(path.node.argument.name, {});
    }
  }
}

export function reactiveArrayPattern(
  path: NodePath<types.LVal | types.OptionalMemberExpression | types.VoidPattern>,
  internal: Internal,
) {
  if (path.isArrayPattern()) {
    path.get("elements").forEach((element, index) => {
      /* istanbul ignore else */
      if (index < 2) {
        checkReactiveName(element, internal);
      } else if (element.isIdentifier()) {
        checkNonReactiveName(element, internal);
        internal.stack.set(element.node.name, {});
      }
    });
  } else {
    err(Errors.TokenNotSupported, path, "Expected array pattern", internal);
  }
}

function meshForEachHeader(path: NodePath<types.ForInStatement | types.ForOfStatement>, internal: Internal) {
  const left = path.node.left;

  meshExpression(path.get("right"), internal);
  /* istanbul ignore else */
  if (t.isVariableDeclaration(left) && t.isVariableDeclarator(left.declarations[0])) {
    ignoreParams(path.get("left").get("declarations")[0].get("id"), internal, false);
  }
}

function meshForHeader(path: NodePath<types.ForStatement>, internal: Internal) {
  const node = path.node;

  /* istanbul ignore else */
  if (node.init) {
    const initPath = path.get("init");

    if (initPath.isExpression()) {
      meshExpression(initPath, internal);
    } else {
      for (const declarationPath of initPath.get("declarations")) {
        meshExpression(declarationPath.get("init"), internal);
        ignoreParams(declarationPath.get("id"), internal, false);
      }
    }
  }

  meshExpression(path.get("test"), internal);
  meshExpression(path.get("update"), internal);
}

function meshClassBody(path: NodePath<types.ClassBody>, internal: Internal) {
  for (const item of path.get("body")) {
    /* istanbul ignore else */
    if (item.isClassMethod() || item.isClassPrivateMethod()) {
      meshFunction(item, internal);
    } else if (item.isClassProperty()) {
      const key = item.get("key");
      const value = item.get("value");

      if (value.isCallExpression() && calls(value, ["ref"], internal)) {
        checkReactiveName(key, internal);
        meshAllUnknown(value.get("arguments"), internal);
      } else {
        if (key.isIdentifier() && value.node !== null) {
          checkNonReactiveName(key, internal);
        }
        meshExpression(item.get("value"), internal);
      }
    } else if (item.isClassAccessorProperty()) {
      meshExpression(item.get("value"), internal);
    } else if (item.isClassPrivateProperty()) {
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
    const keyPath = prop.get("key");
    const valuePath = prop.get("value");
    /* istanbul ignore else */
    if (prop.isObjectProperty()) {
      // the property name is known in compile time
      if ((!prop.node.computed || keyPath.isStringLiteral()) && valuePath.isExpression()) {
        const call =
          (internal.isComposing && !internal.isFunctionParsing) ||
          calls(valuePath, ["ref", "bind", "calculate"], internal)
            ? checkNode(valuePath, internal)
            : null;
        const name = stringify(keyPath.node);

        if ((call?.found.size ?? 0) > 0) {
          err(Errors.RulesOfVasille, valuePath, "Objects can not contains bind expressions", internal);
        } else if (call?.self) {
          if (!name.startsWith("$")) {
            err(Errors.RulesOfVasille, keyPath, "Reactive field name must start with $", internal);
          }
          state[name] = 1;
        } else {
          if (valuePath.isObjectExpression()) {
            procedureProcessObjectExpression(valuePath, internal, state, `${prefix}${name}.`);
          }

          if (name.startsWith("$")) {
            if (internal.isComposing && !internal.isFunctionParsing) {
              meshExpression(valuePath, internal);
              valuePath.replaceWith(internal.ref(valuePath.node));
              state[name] = 1;
            } else if (
              !(
                (valuePath.isIdentifier() && idIsIValue(valuePath)) ||
                (valuePath.isMemberExpression() && memberIsIValue(valuePath.node))
              )
            ) {
              err(Errors.RulesOfVasille, prop.get("key"), "This property is not a reactive", internal);
            }
          } else {
            meshExpression(valuePath, internal);
          }
        }
      }
      // the property name is unknown in compile time
      else {
        meshOrIgnoreExpression<types.PrivateName>(keyPath, internal);
        meshLValue(valuePath, internal);
        /* istanbul ignore else */
        if (keyPath.isExpression() && valuePath.isExpression()) {
          valuePath.replaceWith(internal.match(keyPath.node, valuePath.node));
        }
      }
    } else if (prop.isObjectMethod()) {
      if (
        (keyPath.isIdentifier() && keyPath.node.name.startsWith("$") && !prop.node.computed) ||
        (keyPath.isStringLiteral() && keyPath.node.value.startsWith("$"))
      ) {
        err(Errors.RulesOfVasille, prop.get("key"), "Method name can not start with $", internal);
      }
      meshStatement(prop.get("body"), internal);
    } else if (prop.isSpreadElement()) {
      const argumentPath = prop.get("argument");

      if (argumentPath.isObjectExpression()) {
        procedureProcessObjectExpression(argumentPath, internal, state, prefix);
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
        const initPath = declaration.get("init");
        const composeMethod = calls(initPath, composeFunctions, internal);
        const id = declaration.node.id;
        const idPath = declaration.get("id");

        if (t.isIdentifier(id) && composeMethod) {
          const name = id.name;
          const idPath = declaration.get("id");
          const isNotUpperCase = name[0].toUpperCase() !== name[0];
          const isNotLowerCase = name[0].toLowerCase() !== name[0];

          function report(error: string) {
            err(Errors.RulesOfVasille, idPath, error, internal);
          }

          if (calls(initPath, ["compose", "component"], internal)) {
            if (isNotUpperCase) {
              report("The component name must start with a uppercase letter");
            }
            if (internal.strictFolders && !internal.filename.includes("/components/")) {
              report("Components must be placed in a folder named `components`");
            }
          }
          if (calls(initPath, ["view"], internal)) {
            if (isNotUpperCase) {
              report("The view name must start with a uppercase letter");
            }
            if (!name.endsWith("View")) {
              report("The view name must end with `View`");
            }
            if (internal.strictFolders && !internal.filename.includes("/views/")) {
              report("Views must be placed in a folder named `views`");
            }
          }
          if (calls(initPath, ["store"], internal)) {
            if (isNotLowerCase) {
              report("The store name must start with a lowercase letter");
            }
            if (!name.endsWith("Store")) {
              report("The store name must end with `Store`");
            }
            if (internal.strictFolders && !internal.filename.includes("/stores/")) {
              report("Stores must be placed in a folder named `stores`");
            }
          }
          if (calls(initPath, ["model"], internal)) {
            if (isNotLowerCase) {
              report("The model constructor function name must start with a lowercase letter");
            }
            if (!name.endsWith("Model")) {
              report("The model constructor function name must end with `Model`");
            }
            if (internal.strictFolders && !internal.filename.includes("/models/")) {
              report("Models must be placed in a folder named `models`");
            }
          }
          if (calls(initPath, ["modal"], internal)) {
            if (isNotUpperCase) {
              report("The modal component name must start with a uppercase letter");
            }
            if (!name.endsWith("Modal")) {
              report("The modal component name must end with `Modal`");
            }
            if (internal.strictFolders && !internal.filename.includes("/modals/")) {
              report("Modals must be placed in a folder named `modals`");
            }
          }
          if (calls(initPath, ["prompt"], internal)) {
            if (!name.startsWith("prompt")) {
              report("The prompt function name must start with `prompt`");
            }
            if (internal.strictFolders && !internal.filename.includes("/prompts/")) {
              report("Prompts must be placed in a folder named `prompts`");
            }
          }
          if (calls(initPath, ["screen"], internal)) {
            if (!name.endsWith("Screen")) {
              report("The screen name must start with `Screen`");
            }
            if (internal.strictFolders && !internal.filename.includes("/screens/")) {
              report("Screens must be placed in a folder named `screens`");
            }
          }
          if (calls(initPath, ["page"], internal)) {
            report("Use export default instead");
          }
          if (t.isExportNamedDeclaration(path.parent)) {
            /* istanbul ignore else */
            if (
              ![".ts", ".tsx", ".js", ".jsx"].some(ext => {
                return internal.filename.endsWith(`${name}${ext}`);
              })
            ) {
              report(`File name is not correct, expected ${name}.ts, ${name}.tsx, ${name}.js or ${name}.jsx`);
            }
          }
          meshComposeCall(id.name, initPath, internal);
        }
        // calculate call
        else if (calls(initPath, ["calculate"], internal) && processCalculateCall(initPath, internal)) {
          checkReactiveName(idPath, internal);
        }
        // ref call
        else if (calls(initPath, reactivityFunctions, internal)) {
          meshAllUnknown(initPath.get("arguments"), internal);
          checkReactiveName(idPath, internal);
        }
        // bind call
        else if (calls(initPath, ["bind"], internal) && exprCall(initPath, initPath.node, internal, { strong: true })) {
          checkReactiveName(idPath, internal);
        }
        // variable declaration
        else {
          ignoreParams(declaration.get("id"), internal, ["id", "array"]);
          idPath.isIdentifier() && checkNonReactiveName(idPath, internal);

          if (initPath.isObjectExpression() && t.isIdentifier(declaration.node.id) && _path.node.kind === "const") {
            internal.stack.set(declaration.node.id.name, processObjectExpression(initPath, internal));
          } else {
            meshExpression(initPath, internal);
          }
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
    case "ClassDeclaration": {
      const classPath = path as NodePath<types.ClassDeclaration>;
      const idPath = classPath.get("id");

      /* istanbul ignore else */
      if (idPath.isIdentifier()) {
        checkNonReactiveName(idPath, internal);
      }
      meshClassBody(classPath.get("body"), internal);

      break;
    }

    case "ExportDefaultDeclaration": {
      const declarationPath = (path as NodePath<types.ExportDefaultDeclaration>).get("declaration");

      /* istanbul ignore else */
      // export default 23;
      if (declarationPath.isExpression()) {
        meshExpression(declarationPath, internal);
      }
      // export default function ..
      else if (declarationPath.isFunctionDeclaration()) {
        meshFunction(declarationPath, internal);
      }
      // export default class ..
      else if (declarationPath.isClassDeclaration()) {
        meshClassBody(declarationPath.get("body"), internal);
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
  if (path.isFunctionDeclaration() && path.node.id) {
    const idPath = path.get("id");

    /* istanbul ignore else */
    if (idPath.isIdentifier()) {
      internal.stack.set(path.node.id.name, {});
      checkNonReactiveName(idPath, internal);
    }
  }

  internal.stack.push();

  if (path.isFunctionExpression() && path.node.id) {
    internal.stack.set(path.node.id.name, {});
  }

  for (const param of path.get("params")) {
    ignoreParams(param, internal, false);
  }

  const bodyPath = path.get("body");

  /* istanbul ignore else */
  if (bodyPath.isExpression()) {
    meshExpression(bodyPath, internal);
  } else if (bodyPath.isBlockStatement()) {
    meshStatement(bodyPath, internal);
  }

  internal.stack.pop();
}

export function composeExpression(path: NodePath<types.Expression | null | undefined>, internal: Internal) {
  const expr = path.node;

  switch (expr && expr.type) {
    case "CallExpression":
    case "OptionalCallExpression": {
      /* istanbul ignore else */
      if (calls(path, ["watch"], internal)) {
        parseCalculateCall(path, internal);

        const args = (path.node as types.CallExpression).arguments;

        /* istanbul ignore else */
        if (args) {
          if ((args[2] as types.ArrayExpression).elements.length <= 0) {
            path.replaceWith(t.callExpression(args[1] as types.Expression, []));
          }
        }
      } else if (calls(path, ["beforeMount", "afterMount"], internal)) {
        const arg = path.get("arguments")[0];

        if (arg && (arg.isFunctionExpression() || arg.isArrowFunctionExpression())) {
          meshFunction(arg, internal);
          path.replaceWith(t.callExpression(internal.safe(arg.node), []));
        } else {
          err(Errors.IncorrectArguments, path, "Incorrect hint argument", internal);
        }
      } else if (calls(path, ["beforeDestroy"], internal)) {
        if (internal.stateOnly) {
          err(Errors.IncompatibleContext, path, "Stores in Vasille.JS are not destroyable", internal);
        }

        path.get("callee").replaceWith(t.memberExpression(ctx, t.identifier("runOnDestroy")));
      }
      break;
    }
    case "JSXElement":
    case "JSXFragment":
      if (internal.stateOnly) {
        return err(Errors.IncompatibleContext, path, "JSX is not allowed in states", internal);
      }
      const conditions: ConditionCollection = { cases: null };

      path.replaceWithMultiple([
        ...transformJsx(path as NodePath<types.JSXElement | types.JSXFragment>, conditions, internal),
        ...processConditions(conditions, internal),
      ]);
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

  switch (statement?.type) {
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
    case "ExpressionStatement": {
      composeExpression((path as NodePath<types.ExpressionStatement>).get("expression"), internal);
      break;
    }

    case "ReturnStatement":
      composeExpression((path as NodePath<types.ReturnStatement>).get("argument"), internal);
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

          return [idName(pattern.elements?.[0]), idName(pattern.elements?.[1])];
        }

        ignoreParams(declaration.get("id"), internal, ["id", "array"]);

        /* istanbul ignore else */
        if (calls(declaration.get("init"), ["awaited"], internal)) {
          const callPath = declaration.get("init") as NodePath<types.CallExpression>;

          reactiveArrayPattern(declaration.get("id"), internal);
          meshAllUnknown(callPath.get("arguments"), internal);
          /* istanbul ignore else */
          if (internal.devMode) {
            callPath.node.arguments.push(ctx);
          }
          named(callPath.node, idDoubleName(), internal, 2);
          meshInit = false;
        } else if (t.isIdentifier(id)) {
          const idPath = declaration.get("id") as NodePath<types.Identifier>;

          internal.stack.set(id.name, {});

          const init = declaration.node.init;
          const initPath = declaration.get("init");

          // let a = raw(0)
          if (calls(initPath, ["raw"], internal)) {
            declaration.get("init").replaceWith((init as types.CallExpression).arguments[0]);
            _path.node.kind = kind;
            switchToConst = false;
            checkNonReactiveName(idPath, internal);
          }
          // const x = bind(a + b);
          else if (calls(initPath, ["bind", "calculate"], internal)) {
            const argument = (init as types.CallExpression).arguments[0] as types.Expression;
            const isReactive = exprCall(initPath, initPath.node, internal, { name: idName(), strong: true });

            meshInit = !isReactive;

            if (!isReactive) {
              declaration.get("init").replaceWith(ref(argument, internal, idName()));
            }
            checkReactiveName(idPath, internal);
          }
          // let y = ref(2)
          else if (calls(initPath, ["ref"], internal)) {
            meshAllUnknown(initPath.get("arguments"), internal);

            const argument = (init as types.CallExpression).arguments[0];

            declaration.get("init").replaceWith(ref(t.isExpression(argument) ? argument : null, internal, idName()));
            checkReactiveName(idPath, internal);
            meshInit = false;
          }
          // const arr = arrayModel()
          else if (calls(initPath, ["arrayModel"], internal)) {
            processModelCall(initPath, "Array", kind === "const", internal, idName());
            meshInit = false;
            checkNonReactiveName(idPath, internal);
          }
          // const map = mapModel();
          else if (calls(initPath, ["mapModel"], internal)) {
            processModelCall(initPath, "Map", kind === "const", internal, idName());
            meshInit = false;
            checkNonReactiveName(idPath, internal);
          }
          // const set = setModel();
          else if (calls(initPath, ["setModel"], internal)) {
            processModelCall(initPath, "Set", kind === "const", internal, idName());
            meshInit = false;
            checkNonReactiveName(idPath, internal);
          }
          // const x = { .. }
          else if (t.isObjectExpression(init)) {
            internal.stack.set(
              id.name,
              processObjectExpression(initPath as NodePath<types.ObjectExpression>, internal),
            );
            meshInit = false;
            checkNonReactiveName(idPath, internal);
          }
          // const a = []
          else if (initPath.isArrayExpression()) {
            if (kind !== "const") {
              err(Errors.RulesOfVasille, declaration, "Arrays must be must be declared as constants", internal);
            }

            meshExpression(initPath, internal);
            meshInit = false;

            initPath.replaceWith(arrayModel([initPath.node], internal, idName()));
            checkNonReactiveName(idPath, internal);
          }
          // const s = new Set(), const m = new Map()
          else if (initPath.isNewExpression() && t.isIdentifier(initPath.node.callee)) {
            const name = initPath.node.callee.name;

            if (name === "Map" || name === "Set") {
              processModelCall(initPath, name, kind === "const", internal, idName());
              meshInit = false;
              checkNonReactiveName(idPath, internal);
            }
          } else if (kind === "let") {
            meshExpression(declaration.get("init"), internal);

            if (idPath.isIdentifier() && idPath.node.name.startsWith("$")) {
              declaration.get("init").replaceWith(ref(declaration.node.init, internal, idName()));
            } else {
              switchToConst = false;
            }
            meshInit = false;
          } else {
            const isReactive = exprCall(declaration.get("init"), declaration.node.init, internal, {
              name: idName(),
              strong: true,
            });

            if (isReactive) {
              checkReactiveName(idPath, internal);
            } else {
              checkNonReactiveName(idPath, internal);
            }
            meshInit = !isReactive;
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
    default:
      meshStatement(path, internal);
  }
}

export function compose(
  path: NodePath<types.ArrowFunctionExpression | types.FunctionExpression>,
  internal: Internal,
  isInternalSlot: boolean,
  isSlot: boolean,
) {
  internal.stack.push();

  const node = path.node;
  const params = node.params;
  const body = path.isArrowFunctionExpression() ? path.get("body") : path.get("body");

  if (t.isFunctionExpression(node) && node.id) {
    internal.stack.set(node.id.name, {});
  }

  if (params.length > 1 && !isInternalSlot) {
    err(Errors.IncorrectArguments, path.get("params")[1], "Extra parameters are not allowed", internal);
  }

  for (const param of path.get("params")) {
    ignoreParams(param, internal, false);
  }

  if (!isSlot) {
    internal.isComposing = true;
  }

  /* istanbul ignore else */
  if (body.isExpression()) {
    composeExpression(body, internal);
  } else if (body.isBlockStatement()) {
    checkOrder(body.get("body"), internal);
    composeStatement(body, internal);
  }

  if (!isSlot) {
    internal.isComposing = false;
  }

  internal.stack.pop();
}
