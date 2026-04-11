import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { calls, composeFunctions, dependencyInjections, hintFunctions, modelFunctions, refFunctions } from "./call.js";
import { checkNode, exprIsSure, idIsIValue, memberIsIValue, nodeIsMeshed } from "./expression.js";
import { ctx, inspector, Internal, V, VariableState } from "./internal.js";
import { ConditionCollection, processConditions, transformJsx } from "./jsx.js";
import {
  arrayModel,
  checkNonReactiveName,
  checkReactiveName,
  err,
  Errors,
  exprCall,
  nameIsRestricted,
  parseCalculateCall,
  processCalculateCall,
  processModelCall,
  ref,
  toKebabCase,
} from "./lib.js";
import { checkOrder } from "./order-check";
import { routerReplace } from "./router";
import { stringify } from "./utils";
import { nodeToStaticPosition } from "./transformer";
import { processReference, processTypeLiteral, registerInterface } from "./process-types";
import { assignmentToBinaryOperator, assignmentToLogicalOperator, meshAssigment } from "./operators";

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

const restrictedNames = [
  "annotation-xml",
  "color-profile",
  "font-face",
  "font-face-src",
  "font-face-uri",
  "font-face-format",
  "font-face-name",
  "missing-glyph",
];

export function meshComposeCall(
  name: string | null | undefined,
  path: NodePath<types.Node | null | undefined>,
  internal: Internal,
  isExported = false,
) {
  const args = path.isCallExpression() && path.get("arguments");
  const arg = args && args[0] && (args[0].isFunctionExpression() || args[0].isArrowFunctionExpression()) && args[0];

  if (!args || !arg || args.length !== 1) {
    return err(Errors.IncorrectArguments, path, "Invalid arguments number", internal);
  }

  compose(arg, internal, false, false);
  arg.node.params.unshift(ctx);

  if (internal.devLayer && path.isCallExpression()) {
    path.node.arguments.push(nodeToStaticPosition(path.node), t.stringLiteral(name ? name : "#"));
  }
  if (internal.shadow && isExported && name && path.isCallExpression()) {
    const call = path.node;
    const generics = call.typeParameters?.params;
    const args = call.arguments;
    const params = (t.isFunctionExpression(args[0]) || t.isArrowFunctionExpression(args[0])) && args[0].params;
    const annotation =
      (generics && generics[0]) ||
      (params && params[1] && !t.isVoidPattern(params[1]) && params[1].typeAnnotation) ||
      null;
    const type =
      (t.isTSTypeAnnotation(annotation) && annotation.typeAnnotation) || (t.isTSType(annotation) && annotation) || null;
    const kebabName = toKebabCase(name);
    let fields: types.ObjectExpression | undefined;

    if (t.isTSTypeLiteral(type)) {
      fields = processTypeLiteral(type);
    }
    if (t.isTSTypeReference(type)) {
      fields = processReference(type, internal);
    }

    if (kebabName.indexOf("-") === -1 || restrictedNames.indexOf(kebabName) !== -1) {
      err(Errors.ParserError, path, `The name '${kebabName}' is not allowed by WHATWG`, internal);
    }

    if (fields) {
      path.node.arguments.push(t.stringLiteral(kebabName), fields);
    } else {
      err(Errors.RulesOfVasille, path, "Missing type for web component composition", internal);
    }
  }
}

export function meshAllUnknown(
  paths: NodePath<types.SpreadElement | types.ArgumentPlaceholder | types.Expression | null>[],
  internal: Internal,
) {
  for (const path of paths) {
    if (path.isSpreadElement()) {
      meshExpression(path.get("argument"), internal);
    } else {
      /* istanbul ignore else */
      if (path.isExpression()) {
        meshExpression(path, internal);
      }
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
      if (idIsIValue(nodePath as NodePath<types.Identifier>) && !nodeIsMeshed(nodePath)) {
        nodePath.replaceWith(t.memberExpression(expr, V));
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

        const loc = path.node.loc;

        if (calls(path, ["arrayModel"], internal)) {
          path.replaceWith(internal.arrayModel(argPath?.node, path.node, undefined));
        } else if (calls(path, ["mapModel"], internal)) {
          path.replaceWith(internal.mapModel(argPath?.node, path.node, undefined));
        } else {
          /* istanbul ignore else */
          if (calls(path, ["setModel"], internal)) {
            path.replaceWith(internal.setModel(argPath?.node, path.node, undefined));
          }
        }

        path.node.loc = loc;
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
        processCalculateCall(path, internal, path.node, undefined);
      } else if (
        path.isCallExpression() &&
        t.isIdentifier(path.node.callee) &&
        path.node.callee.name.startsWith("prompt")
      ) {
        if (!internal.isComposing) {
          err(Errors.IncompatibleContext, path, "Prompts can be constructed only from components", internal);
        }
        path.node.arguments.unshift(ctx);

        if (internal.devLayer) {
          while (path.node.arguments.length < 3) {
            path.node.arguments.push(t.buildUndefinedNode());
          }
          path.node.arguments.push(nodeToStaticPosition(path.node));
        }
      }
      // dependency injection
      else if (
        internal.isComposing &&
        !internal.stateOnly &&
        calls(path, dependencyInjections, internal) &&
        path.node.arguments[0] === ctx
      ) {
        meshAllUnknown(path.get("arguments"), internal);
      }
      // call any other functions invalid if code calls a hint
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
          meshAssigment(path, left, right, property, internal);
        }
      } else if (
        internal.devLayer &&
        ((left.isIdentifier() && idIsIValue(left)) || (left.isMemberExpression() && memberIsIValue(left.node)))
      ) {
        meshExpression(right, internal);
        path.replaceWith(internal.updateIValue(path.node, left.node, right.node));
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
      const propertyPath = path.get("property");

      meshExpression(path.get("object"), internal);
      if (t.isExpression(property) && (!propertyPath.isIdentifier() || (node.computed && idIsIValue(propertyPath)))) {
        meshOrIgnoreExpression<types.PrivateName>(propertyPath, internal);
      }

      if (memberIsIValue(node)) {
        if (!nodeIsMeshed(path)) {
          if (exprIsSure(path, internal)) {
            path.replaceWith(t.memberExpression(path.node, V));
          } else {
            path.replaceWith(t.optionalMemberExpression(path.node, V, false, true));
          }
        }
      } else if (node.computed && t.isIdentifier(property)) {
        path.replaceWith(internal.match(t.stringLiteral(""), node, node));
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
    if (nameIsRestricted(path.node.name)) {
      err(Errors.RulesOfVasille, path, "This name is restricted (start with `prompt` or ends with `Model`)", internal);
    }
  }
  // param is object destruction
  else if (path.isObjectPattern()) {
    ignoreObjectPattern(path, internal);
  }
  // param is array destruction
  else if (path.isArrayPattern()) {
    for (const element of path.get("elements")) {
      /* istanbul ignore else */
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

        if (
          (t.isIdentifier(property.key) && property.key.name.startsWith("$")) ||
          (t.isStringLiteral(property.key) && property.key.value.startsWith("$"))
        ) {
          right.replaceWith(internal.ref(right.node, property, undefined));
        } else {
          /* istanbul ignore else */
          if (property.computed && !t.isStringLiteral(property.key)) {
            err(Errors.RulesOfVasille, valuePath, "Computed property can not be used in destruction", internal);
          }
        }
      } else {
        /* istanbul ignore else */
        if (t.isIdentifier(property.value)) {
          internal.stack.set(property.value.name, {});

          if (property.value.name.startsWith("$")) {
            path.get("value").replaceWith(t.assignmentPattern(property.value, internal.ref(null, property, undefined)));
          }
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
      if (index < 2) {
        checkReactiveName(element, internal);
      } else {
        /* istanbul ignore else */
        if (element.isIdentifier()) {
          checkNonReactiveName(element, internal);
          internal.stack.set(element.node.name, {});
        }
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
    if (item.isClassMethod() || item.isClassPrivateMethod()) {
      meshFunction(item, internal);
    } else if (item.isClassProperty()) {
      const key = item.get("key");
      const value = item.get("value");

      if (value.isCallExpression() && calls(value, ["ref"], internal)) {
        const refValue = value.node.arguments[0];
        const pos = value.node.loc;

        checkReactiveName(key, internal);
        meshAllUnknown(value.get("arguments"), internal);
        value.replaceWith(
          ref(
            t.isExpression(refValue) ? refValue : null,
            internal,
            item.node,
            key.isIdentifier() ? key.node.name : undefined,
          ),
        );
        value.node.loc = pos;
      } else {
        if (key.isIdentifier() && value.node !== null) {
          checkNonReactiveName(key, internal);
        }
        meshExpression(item.get("value"), internal);
      }
    } else {
      /* istanbul ignore else */
      if (item.isClassPrivateProperty()) {
        meshExpression(item.get("value"), internal);
      }
    }
  }
}

function procedureProcessObjectExpression(
  path: NodePath<types.ObjectExpression>,
  internal: Internal,
  state: VariableState,
): VariableState {
  for (const prop of path.get("properties")) {
    const keyPath = prop.get("key");
    const valuePath = prop.get("value");
    if (prop.isObjectProperty()) {
      // the property name is known in compile time
      if ((!prop.node.computed || keyPath.isStringLiteral()) && valuePath.isExpression()) {
        const call =
          (internal.isComposing && !internal.isFunctionParsing) ||
          calls(valuePath, ["ref", "bind", "calculate"], internal)
            ? checkNode(valuePath, internal, prop.node)
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
            procedureProcessObjectExpression(valuePath, internal, state);
          }

          if (name.startsWith("$")) {
            if (internal.isComposing && !internal.isFunctionParsing) {
              meshExpression(valuePath, internal);
              valuePath.replaceWith(internal.ref(valuePath.node, prop.node, undefined));
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
          valuePath.replaceWith(internal.match(keyPath.node, valuePath.node, prop.node));
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
      internal.wrapFunctionBody(prop.node);
    } else {
      /* istanbul ignore else */
      if (prop.isSpreadElement()) {
        const argumentPath = prop.get("argument");

        if (argumentPath.isObjectExpression()) {
          procedureProcessObjectExpression(argumentPath, internal, state);
        } else {
          meshExpression(argumentPath, internal);
        }
      }
    }
  }

  return state;
}

export function processObjectExpression(path: NodePath<types.ObjectExpression>, internal: Internal): VariableState {
  return procedureProcessObjectExpression(path, internal, {});
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
          const isExported = t.isExportNamedDeclaration(path.parent);

          function report(error: string) {
            err(Errors.RulesOfVasille, idPath, error, internal);
          }

          if (calls(initPath, ["compose", "component"], internal)) {
            if (isNotUpperCase) {
              report("The component name must start with a uppercase letter");
            }
            if (isExported && internal.strictFolders && !internal.filename.includes("/components/")) {
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
            if (isExported && internal.strictFolders && !internal.filename.includes("/views/")) {
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
            if (isExported && internal.strictFolders && !internal.filename.includes("/stores/")) {
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
            if (isExported && internal.strictFolders && !internal.filename.includes("/models/")) {
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
            if (isExported && internal.strictFolders && !internal.filename.includes("/modals/")) {
              report("Modals must be placed in a folder named `modals`");
            }
          }
          if (calls(initPath, ["prompt"], internal)) {
            if (!name.startsWith("prompt")) {
              report("The prompt function name must start with `prompt`");
            }
            if (isExported && internal.strictFolders && !internal.filename.includes("/prompts/")) {
              report("Prompts must be placed in a folder named `prompts`");
            }
          }
          if (calls(initPath, ["screen"], internal)) {
            if (!name.endsWith("Screen")) {
              report("The screen name must start with `Screen`");
            }
            if (isExported && internal.strictFolders && !internal.filename.includes("/screens/")) {
              report("Screens must be placed in a folder named `screens`");
            }
          }
          if (calls(initPath, ["page"], internal)) {
            report("Use export default instead");
          }
          if (isExported) {
            /* istanbul ignore else */
            if (
              ![".ts", ".tsx", ".js", ".jsx"].some(ext => {
                return internal.filename.endsWith(`${name}${ext}`);
              })
            ) {
              report(`File name is not correct, expected ${name}.ts, ${name}.tsx, ${name}.js or ${name}.jsx`);
            }
          }
          meshComposeCall(id.name, initPath, internal, isExported);
        }
        // calculate call
        else if (
          calls(initPath, ["calculate"], internal) &&
          processCalculateCall(initPath, internal, declaration.node, t.isIdentifier(id) ? id.name : undefined)
        ) {
          if (!idPath.isArrayPattern() && !idPath.isObjectPattern()) {
            checkReactiveName(idPath, internal);
          }
        }
        // ref call
        else if (calls(initPath, refFunctions, internal)) {
          const refValue = initPath.node.arguments[0];
          const pos = initPath.node.loc;

          meshAllUnknown(initPath.get("arguments"), internal);
          checkReactiveName(idPath, internal);
          initPath.replaceWith(ref(refValue, internal, declaration.node));
          initPath.node.loc = pos;
        }
        // bind call
        else if (
          calls(initPath, ["bind"], internal) &&
          exprCall(initPath, initPath.node, internal, { strong: true }, declaration.node)
        ) {
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

      // export default 23;
      if (declarationPath.isExpression()) {
        meshExpression(declarationPath, internal);
      }
      // export default function ..
      else if (declarationPath.isFunctionDeclaration()) {
        meshFunction(declarationPath, internal);
      }
      // export default class ..
      else {
        /* istanbul ignore else */
        if (declarationPath.isClassDeclaration()) {
          meshClassBody(declarationPath.get("body"), internal);
        }
      }
      break;
    }
    case "TSInterfaceDeclaration": {
      const declaration = path.node as types.TSInterfaceDeclaration;

      registerInterface(declaration.id.name, declaration.body.body, internal);
      break;
    }
    case "TSTypeAliasDeclaration": {
      const alias = path.node as types.TSTypeAliasDeclaration;

      if (t.isTSTypeLiteral(alias.typeAnnotation)) {
        registerInterface(alias.id.name, alias.typeAnnotation.members, internal);
      }
      break;
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
      if (internal.devLayer) {
        path.insertAfter(internal.setupPosition(idPath.node, path.node));
      }
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

  if (bodyPath.isExpression()) {
    meshExpression(bodyPath, internal);
  } else {
    /* istanbul ignore else */
    if (bodyPath.isBlockStatement()) {
      meshStatement(bodyPath, internal);
    }
  }

  if (path.isFunctionExpression() || path.isArrowFunctionExpression()) {
    path.replaceWith(internal.wrapFunction(path.node));
  } else {
    internal.wrapFunctionBody(
      path.node as types.FunctionDeclaration | types.ObjectMethod | types.ClassMethod | types.ClassPrivateMethod,
    );
  }

  internal.stack.pop();
}

export function composeExpression(path: NodePath<types.Expression | null | undefined>, internal: Internal) {
  const expr = path.node;

  switch (expr && expr.type) {
    case "CallExpression":
    case "OptionalCallExpression": {
      if (calls(path, ["watch"], internal)) {
        parseCalculateCall(path, internal, path.node, undefined);

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
          err(Errors.IncompatibleContext, path, "Stores/Models in Vasille.JS are not destroyable", internal);
        }

        path.get("callee").replaceWith(t.memberExpression(ctx, t.identifier("runOnDestroy")));
      } else {
        /* istanbul ignore else */
        if (calls(path, ["share"], internal)) {
          if (internal.stateOnly) {
            err(Errors.IncompatibleContext, path, "Stores/Models in Vasille.JS cannot share dependencies", internal);
          }
          path.node.arguments.unshift(ctx);
        }
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

        function idDoubleName(): { names: [string, string]; nodes: [types.Node | null, types.Node | null] } {
          const pattern = id as types.ArrayPattern;

          return {
            names: [idName(pattern.elements?.[0]), idName(pattern.elements?.[1])],
            nodes: [pattern.elements?.[0], pattern.elements?.[1]],
          };
        }

        ignoreParams(declaration.get("id"), internal, ["id", "array"]);

        if (calls(declaration.get("init"), ["awaited"], internal)) {
          const callPath = declaration.get("init") as NodePath<types.CallExpression>;

          reactiveArrayPattern(declaration.get("id"), internal);
          meshAllUnknown(callPath.get("arguments"), internal);
          /* istanbul ignore else */
          if (internal.devLayer) {
            const error = t.identifier("error");
            const value = t.identifier("value");
            const { names, nodes } = idDoubleName();

            callPath.node.arguments.push(
              t.arrowFunctionExpression(
                [error, value],
                t.blockStatement([
                  t.expressionStatement(internal.shareStateById(error, names[0])),
                  t.expressionStatement(internal.shareStateById(value, names[1])),
                ]),
              ),
              t.arrayExpression([nodeToStaticPosition(nodes[0] ?? id), nodeToStaticPosition(nodes[1] ?? id)]),
              inspector,
            );
          }
          meshInit = false;
        } else if (calls(declaration.get("init"), dependencyInjections, internal)) {
          const callPath = declaration.get("init") as NodePath<types.CallExpression>;

          callPath.node.arguments.unshift(ctx);
          meshAllUnknown(callPath.get("arguments"), internal);
          meshInit = false;
          if (t.isIdentifier(id)) {
            checkNonReactiveName(declaration.get("id") as NodePath<types.Identifier>, internal);
          }
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
            const isReactive = exprCall(
              initPath,
              initPath.node,
              internal,
              { name: idName(), strong: true },
              declaration.node,
            );

            meshInit = !isReactive;
            checkReactiveName(idPath, internal);
          }
          // let y = ref(2)
          else if (calls(initPath, ["ref"], internal)) {
            meshAllUnknown(initPath.get("arguments"), internal);

            const argument = (init as types.CallExpression).arguments[0];

            declaration.get("init").replaceWith(ref(argument, internal, declaration.node, idName()));
            checkReactiveName(idPath, internal);
            meshInit = false;
          }
          // const arr = arrayModel()
          else if (calls(initPath, ["arrayModel"], internal)) {
            processModelCall(initPath, declaration.node, "Array", kind === "const", internal, idName());
            meshInit = false;
            checkNonReactiveName(idPath, internal);
          }
          // const map = mapModel();
          else if (calls(initPath, ["mapModel"], internal)) {
            processModelCall(initPath, declaration.node, "Map", kind === "const", internal, idName());
            meshInit = false;
            checkNonReactiveName(idPath, internal);
          }
          // const set = setModel();
          else if (calls(initPath, ["setModel"], internal)) {
            processModelCall(initPath, declaration.node, "Set", kind === "const", internal, idName());
            meshInit = false;
            checkNonReactiveName(idPath, internal);
          }
          // const x = { .. }
          else if (t.isObjectExpression(init) && !(kind === "let" && id.name.startsWith("$"))) {
            internal.stack.set(
              id.name,
              processObjectExpression(initPath as NodePath<types.ObjectExpression>, internal),
            );
            meshInit = false;
            checkNonReactiveName(idPath, internal);
          }
          // const a = []
          else if (initPath.isArrayExpression() && !(kind === "let" && id.name.startsWith("$"))) {
            if (kind !== "const") {
              err(Errors.RulesOfVasille, declaration, "Arrays must be must be declared as constants", internal);
            }

            meshExpression(initPath, internal);
            meshInit = false;

            initPath.replaceWith(arrayModel([initPath.node], declaration.node, internal, idName()));
            checkNonReactiveName(idPath, internal);
          }
          // const s = new Set(), const m = new Map()
          else if (
            initPath.isNewExpression() &&
            t.isIdentifier(initPath.node.callee) &&
            ["Set", "Map"].includes(initPath.node.callee.name) &&
            !(kind === "let" && id.name.startsWith("$"))
          ) {
            processModelCall(
              initPath,
              declaration.node,
              initPath.node.callee.name as "Map" | "Set",
              kind === "const",
              internal,
              idName(),
            );
            meshInit = false;
            checkNonReactiveName(idPath, internal);
          }
          // const x = y[z]
          else if (
            kind === "const" &&
            (initPath.isOptionalMemberExpression() || initPath.isMemberExpression()) &&
            initPath.node.computed &&
            t.isIdentifier(initPath.node.property) &&
            !idIsIValue(initPath.get("property") as NodePath<types.Identifier>)
          ) {
            const path = initPath as NodePath<t.MemberExpression | t.OptionalMemberExpression>;
            const property = path.get("property");

            meshExpression(path.get("object"), internal);
            /* istanbul ignore else */
            if (property.isExpression()) {
              meshExpression(property, internal);
            }

            meshInit = false;
            path.replaceWith(
              internal.match(t.stringLiteral(id.name.startsWith("$") ? "$" : ""), path.node, declaration.node),
            );
          }
          // let x = ..
          else if (kind === "let") {
            meshExpression(declaration.get("init"), internal);

            if (idPath.isIdentifier() && idPath.node.name.startsWith("$")) {
              declaration.get("init").replaceWith(ref(declaration.node.init, internal, declaration.node, idName()));
            } else {
              switchToConst = false;
            }
            meshInit = false;
          }
          // const x = ..
          else {
            const isReactive = exprCall(
              declaration.get("init"),
              declaration.node.init,
              internal,
              {
                name: idName(),
                strong: true,
              },
              declaration.node,
            );

            if (isReactive) {
              checkReactiveName(idPath, internal);
            } else {
              checkNonReactiveName(idPath, internal);
            }
            meshInit = !isReactive;
          }
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

  if (body.isExpression()) {
    composeExpression(body, internal);
  } else {
    /* istanbul ignore else */
    if (body.isBlockStatement()) {
      checkOrder(body.get("body"), internal);
      composeStatement(body, internal);
    }
  }

  if (!isSlot) {
    internal.isComposing = false;
  }

  internal.stack.pop();
}
