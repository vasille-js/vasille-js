import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { ctx, inspector, Internal } from "./internal.js";
import { bodyHasJsx } from "./jsx-detect.js";
import { checkNonReactiveName, checkReactiveName, err, Errors, exprCall, toKebabCase } from "./lib.js";
import { compose, meshExpression } from "./mesh.js";
import { nodeToStaticPosition } from "./transformer";

export interface ConditionCollection {
  cases:
    | {
        condition: types.Expression;
        slot: types.FunctionExpression | types.ArrowFunctionExpression;
        reactive: boolean;
      }[]
    | null;
}

const strongSlotMap: Record<string, ("reactive" | "passive")[]> = {
  ArrayView: ["reactive", "reactive"],
  ArrayModelView: ["passive", "reactive"],
  MapModelView: ["reactive", "passive"],
};

export function transformJsx(
  path: NodePath<types.JSXElement | types.JSXFragment>,
  conditions: ConditionCollection,
  internal: Internal,
): types.Statement[] {
  if (path.isJSXElement()) {
    return transformJsxElement(path, conditions, internal);
  }

  return transformJsxArray(path.get("children"), internal);
}

function textIsSpacesOnly(node: types.Node) {
  return t.isJSXText(node) && /^\s+$/.test(node.value) && node.value !== " ";
}

export function transformJsxArray(
  paths: NodePath<
    types.JSXText | types.JSXExpressionContainer | types.JSXSpreadChild | types.JSXElement | types.JSXFragment
  >[],
  internal: Internal,
): types.Statement[] {
  const result: types.Statement[] = [];
  const conditions: ConditionCollection = { cases: null };

  paths.forEach(path => {
    if (!path.isJSXElement() && !textIsSpacesOnly(path.node)) {
      result.push(...processConditions(conditions, internal));
    }

    if (path.isJSXElement() || path.isJSXFragment()) {
      result.push(...transformJsx(path, conditions, internal));
    } else if (path.isJSXText()) {
      if (!textIsSpacesOnly(path.node)) {
        const fixed = path.node.value
          .replace(/\n\s+$/m, "")
          .replace(/^\s*\n\s+/m, "")
          .replace(/\s*\n\s*/gm, "\n");
        const call = t.callExpression(t.memberExpression(ctx, t.identifier("text")), [
          internal.devLayer ? internal.positionedText(t.stringLiteral(fixed), path.node) : t.stringLiteral(fixed),
        ]);

        call.loc = path.node.loc;

        /* istanbul ignore else */
        if (call.loc) {
          for (const char of path.node.value) {
            if (!/\s/.test(char)) {
              break;
            }
            if (char === "\n") {
              call.loc.start.column = 0;
              call.loc.start.line++;
            } else {
              call.loc.start.column++;
            }
            call.loc.start.index++;
          }
        }

        result.push(t.expressionStatement(call));
      }
    } else if (path.isJSXExpressionContainer()) {
      const conditionalJsx = tryForConditionalJsx(path, internal);

      if (conditionalJsx.length) {
        result.push(...conditionalJsx);
      } else {
        const value = transformJsxExpressionContainer(path, internal, false, false, true, true, false);
        /* istanbul ignore else */
        if (!t.isJSXEmptyExpression(value)) {
          const call = t.callExpression(t.memberExpression(ctx, t.identifier("text")), [
            internal.devLayer ? internal.positionedText(value, value) : value,
          ]);

          call.loc = value.loc;
          result.push(t.expressionStatement(call));
        }
      }
    } else {
      err(Errors.TokenNotSupported, path, "Spread child is not supported", internal);
    }
  });

  result.push(...processConditions(conditions, internal));

  return result;
}

function statementsToFunction(arr: types.Statement[]) {
  if (arr.length == 1 && t.isExpressionStatement(arr[0])) {
    return t.arrowFunctionExpression([ctx], arr[0].expression);
  } else {
    return t.arrowFunctionExpression([ctx], t.blockStatement(arr));
  }
}

function checkIfExpressionIsConditionalJsx(expr: types.Expression): boolean {
  return (
    (t.isLogicalExpression(expr) &&
      expr.operator === "&&" &&
      !t.isJSX(expr.left) &&
      (t.isJSX(expr.right) || checkIfExpressionIsConditionalJsx(expr.right))) ||
    (t.isConditionalExpression(expr) &&
      !t.isJSX(expr.test) &&
      (t.isJSX(expr.consequent) || checkIfExpressionIsConditionalJsx(expr.consequent)) &&
      (t.isJSX(expr.alternate) || checkIfExpressionIsConditionalJsx(expr.alternate)))
  );
}

function processReactiveCondition(path: NodePath<types.Expression>, internal: Internal) {
  const reactive = exprCall(path, path.node, internal, {}, path.node);

  return { reactive, condition: path.node };
}

function addConditionToCollection(
  condition: NodePath<types.Expression>,
  exprPath: NodePath<types.Expression>,
  internal: Internal,
  conditions: ConditionCollection["cases"] & NonNullable<{}>,
) {
  if (exprPath.isJSXElement() || exprPath.isJSXFragment()) {
    const local: ConditionCollection = { cases: null };

    conditions.push({
      ...processReactiveCondition(condition, internal),
      slot: statementsToFunction([...transformJsx(exprPath, local, internal), ...processConditions(local, internal)]),
    });
  } else {
    const local: ConditionCollection["cases"] & NonNullable<{}> = [];
    const _default = processConditionalJsxExpression(exprPath, internal, local);

    /* istanbul ignore else */
    if (local.length) {
      conditions.push({
        ...processReactiveCondition(condition, internal),
        slot: statementsToFunction(processConditions({ cases: local }, internal, _default)),
      });
    }
  }
}

function processConditionalJsxExpression(
  expr: NodePath<types.Expression>,
  internal: Internal,
  conditions: ConditionCollection["cases"] & NonNullable<{}>,
) {
  if (expr.isLogicalExpression()) {
    addConditionToCollection(expr.get("left"), expr.get("right"), internal, conditions);

    return undefined;
  }
  /* istanbul ignore else */
  if (expr.isConditionalExpression()) {
    const consent = expr.get("consequent");
    const alternate = expr.get("alternate");

    addConditionToCollection(expr.get("test"), consent, internal, conditions);

    if (alternate.isJSXFragment() || alternate.isJSXElement()) {
      const local: ConditionCollection = { cases: null };

      return statementsToFunction([...transformJsx(alternate, local, internal), ...processConditions(local, internal)]);
    }

    return processConditionalJsxExpression(alternate, internal, conditions);
  }
}

function tryForConditionalJsx(path: NodePath<types.JSXExpressionContainer>, internal: Internal): types.Statement[] {
  const expr = path.get("expression");

  if (expr.isExpression() && checkIfExpressionIsConditionalJsx(expr.node)) {
    const conditions: ConditionCollection["cases"] & NonNullable<{}> = [];
    const _default = processConditionalJsxExpression(expr, internal, conditions);

    /* istanbul ignore else */
    if (_default || conditions.length) {
      return processConditions({ cases: conditions }, internal, _default);
    }
  }

  return [];
}

function transformJsxExpressionContainer(
  path: NodePath<types.JSXExpressionContainer>,
  internal: Internal,
  acceptSlots: boolean,
  isInternalSlot: boolean,
  acceptsReactive: boolean,
  acceptsRaw: boolean,
  skipParamsCheck: boolean,
): types.Expression {
  const expression = path.get("expression");
  const loc = expression.node.loc;

  if (
    acceptSlots &&
    (expression.isFunctionExpression() || expression.isArrowFunctionExpression()) &&
    bodyHasJsx(expression.node.body)
  ) {
    compose(expression, internal, isInternalSlot, true, skipParamsCheck);

    if (!isInternalSlot) {
      if (expression.node.params.length < 1) {
        expression.node.params.push(t.identifier(`_${internal.prefix}`));
      }
      expression.node.params.push(ctx);
    } else {
      expression.node.params.unshift(ctx);
    }

    expression.node.loc = loc;

    return expression.node;
  } else if (isInternalSlot && (expression.isFunctionExpression() || expression.isArrowFunctionExpression())) {
    expression.node.params.unshift(ctx);
  }

  /* istanbul ignore else */
  if (expression.isExpression()) {
    if (acceptsReactive) {
      // two-side binding
      const isReactive = exprCall(expression, expression.node, internal, { strong: !acceptsRaw }, expression.node);

      if (!isReactive && !acceptsRaw) {
        expression.replaceWith(internal.ref(expression.node, expression.node, undefined));
      }
    } else {
      meshExpression(expression, internal);
    }
  }

  expression.node.loc = loc;

  return expression.node as types.Expression;
}

function idToProp(
  id: types.JSXIdentifier | types.Identifier | types.StringLiteral,
  value: types.Expression,
  from?: number,
) {
  let str = t.isIdentifier(id) || t.isJSXIdentifier(id) ? id.name : id.value;
  let expr: types.Expression;

  if (from) {
    str = str.substring(from);
  }

  if (/^[\w_]+$/.test(str)) {
    expr = t.identifier(str);
  } else {
    expr = t.stringLiteral(str);
  }

  expr.loc = id.loc;

  return t.objectProperty(expr, value);
}

function functionToStatement(fn: types.FunctionExpression | types.ArrowFunctionExpression): types.Statement {
  const body = fn.body;

  if (body.type === "BlockStatement") {
    return t.blockStatement(body.body);
  } else {
    return t.expressionStatement(body);
  }
}

function processConditionItem(
  cases: NonNullable<ConditionCollection["cases"]>,
  index: number,
  _default?: types.FunctionExpression | types.ArrowFunctionExpression,
) {
  if (index === cases.length) {
    if (_default) {
      return functionToStatement(_default);
    }
    return null;
  }

  return t.ifStatement(
    cases[index].condition,
    functionToStatement(cases[index].slot),
    processConditionItem(cases, index + 1, _default),
  );
}

export function processConditions(
  conditions: ConditionCollection,
  internal: Internal,
  _default?: types.FunctionExpression | types.ArrowFunctionExpression,
): types.Statement[] {
  if (!conditions.cases) {
    return [];
  }

  const ret = conditions.cases.every(item => !item.reactive)
    ? [processConditionItem(conditions.cases, 0, _default)]
    : [
        t.expressionStatement(
          internal.Switch(
            t.objectExpression([
              t.objectProperty(
                t.identifier("cases"),
                t.arrayExpression(
                  conditions.cases.map(item =>
                    t.objectExpression([
                      t.objectProperty(t.identifier("$case"), item.condition),
                      t.objectProperty(t.identifier("slot"), item.slot),
                    ]),
                  ),
                ),
              ),
              ...(_default ? [t.objectProperty(t.identifier("default"), _default)] : []),
            ]),
          ),
        ),
      ];

  conditions.cases = null;

  return ret;
}

function transformJsxElement(
  path: NodePath<types.JSXElement>,
  conditions: ConditionCollection,
  internal: Internal,
): types.Statement[] {
  const name = path.node.openingElement.name;
  if (t.isJSXIdentifier(name) && name.name[0].toLowerCase() === name.name[0]) {
    if ((name.name === "head" && !internal.headTag) || (name.name === "body" && !internal.bodyTag)) {
      return [];
    }

    const opening = path.get("openingElement");
    const attrs: types.ObjectProperty[] = [];
    const events: types.ObjectProperty[] = [];
    const bind: types.ObjectProperty[] = [];
    const classElements: types.ArrayExpression["elements"] = [];
    const classObject: (types.ObjectProperty | types.SpreadElement)[] = [];
    const classStatic: types.StringLiteral[] = [];
    const styleObject: (types.ObjectProperty | types.SpreadElement)[] = [];
    const styleStatic: [types.Identifier, types.StringLiteral][] = [];
    let callback: types.Expression | null = null;

    for (const attrPath of opening.get("attributes")) {
      const attr = attrPath.node;

      if (t.isJSXAttribute(attr)) {
        const name = attr.name;
        const valuePath = attrPath.get("value");
        const expressionPath = valuePath.isJSXExpressionContainer() && valuePath.get("expression");

        /* istanbul ignore else */
        if (t.isJSXIdentifier(name)) {
          if (name.name.startsWith("on")) {
            if (expressionPath) {
              /* istanbul ignore else */
              if (expressionPath.isExpression()) {
                meshExpression(expressionPath, internal);
                events.push(idToProp(name, expressionPath.node, 2));
              }
            } else {
              err(Errors.TokenNotSupported, attrPath, "Expected event handler", internal);
            }
          } else if (name.name === "class") {
            // class={[..]}
            if (valuePath.isJSXExpressionContainer() && t.isArrayExpression(valuePath.node.expression)) {
              const arrayExprPath = valuePath.get("expression") as NodePath<types.ArrayExpression>;

              for (const elementPath of arrayExprPath.get("elements")) {
                if (elementPath.isExpression()) {
                  // class={[cond && "string"]}
                  if (
                    elementPath.isLogicalExpression() &&
                    elementPath.node.operator === "&&" &&
                    t.isStringLiteral(elementPath.node.right)
                  ) {
                    exprCall(elementPath.get("left"), elementPath.node.left, internal, {}, elementPath.node);

                    classObject.push(idToProp(elementPath.node.right, elementPath.node.left));
                  }
                  // class={[{..}]}
                  else if (elementPath.isObjectExpression()) {
                    for (const propPath of elementPath.get("properties")) {
                      // class={[{a: b}]}
                      if (propPath.isObjectProperty()) {
                        const keyPath = propPath.get("key");
                        const valuePath = propPath.get("value");

                        /* istanbul ignore else */
                        if (valuePath.isExpression()) {
                          exprCall(valuePath, valuePath.node, internal, {}, elementPath.node);
                        }

                        if (keyPath.isExpression() && !keyPath.isIdentifier()) {
                          meshExpression(keyPath, internal);
                        }

                        classObject.push(t.objectProperty(keyPath.node, valuePath.node));
                      }
                      // class={[{...a}]}
                      else if (propPath.isSpreadElement()) {
                        classObject.push(propPath.node);
                      }
                      // class={[{a(){}}]}
                      else {
                        err(Errors.TokenNotSupported, propPath, "Methods are not allowed here", internal);
                      }
                    }
                  }
                  // class={[".."]}
                  else if (elementPath.isStringLiteral()) {
                    classStatic.push(elementPath.node);
                  }
                  // class={[..]}
                  else {
                    exprCall(elementPath, elementPath.node, internal, { strong: true }, elementPath.node);

                    classElements.push(elementPath.node);
                  }
                }
                // class={[...array]}
                else {
                  classElements.push(elementPath.node);
                }
              }
            }
            // class={"a b"}
            else if (expressionPath && expressionPath.isStringLiteral()) {
              attrs.push(t.objectProperty(t.identifier("class"), expressionPath.node));
            }
            // class={`a ${b}`}
            else if (expressionPath && expressionPath.isExpression()) {
              if (exprCall(expressionPath, expressionPath.node, internal, { strong: true }, expressionPath.node)) {
                internal.reportError("This will slow down your application", attrPath.node);
              }

              attrs.push(t.objectProperty(t.identifier("class"), expressionPath.node));
            }
            // class="a b"
            else {
              /* istanbul ignore else */
              if (valuePath.isStringLiteral()) {
                classStatic.push(valuePath.node);
              }
            }
          } else if (name.name === "style") {
            // style={{..}}
            if (expressionPath && expressionPath.isObjectExpression()) {
              for (const propPath of expressionPath.get("properties")) {
                // style={{a: b}}
                if (propPath.isObjectProperty()) {
                  const prop = propPath;
                  const valuePath = prop.get("value");

                  /* istanbul ignore else */
                  if (valuePath.isExpression()) {
                    exprCall(valuePath, valuePath.node, internal, { strong: true }, prop.node);
                  }

                  const value = valuePath.node;
                  const keyPath = propPath.get("key");

                  if (keyPath.isExpression() && !keyPath.isIdentifier()) {
                    meshExpression(keyPath, internal);
                  }

                  // style={{a: "b"}} -> static in compile time
                  if (keyPath.isIdentifier() && valuePath.isStringLiteral()) {
                    styleStatic.push([keyPath.node, valuePath.node]);
                  }
                  // style={{a: 23}} -> static in compile time
                  else if (keyPath.isIdentifier() && valuePath.isNumericLiteral()) {
                    styleStatic.push([keyPath.node, t.stringLiteral(`${valuePath.node.value}px`)]);
                  }
                  // style={{a: [1, 2, 3]}} -> static in compile time
                  else if (
                    keyPath.isIdentifier() &&
                    valuePath.isArrayExpression() &&
                    valuePath.node.elements.every(item => t.isNumericLiteral(item))
                  ) {
                    styleStatic.push([
                      keyPath.node,
                      t.stringLiteral(
                        valuePath.node.elements
                          .map(item => {
                            return `${(item as types.NumericLiteral).value}px`;
                          })
                          .join(" "),
                      ),
                    ]);
                  }
                  // need processing in run time
                  else {
                    styleObject.push(t.objectProperty(prop.node.key, value));
                  }
                }
                // style={{...a}}
                else if (t.isSpreadElement(propPath.node)) {
                  styleObject.push(propPath.node);
                }
                // style={{a(){}}}
                else {
                  err(Errors.TokenNotSupported, propPath, "Methods are not allowed here", internal);
                }
              }
            }
            // style=".."
            else if (valuePath.isStringLiteral()) {
              attrs.push(t.objectProperty(t.identifier("style"), valuePath.node));
            }
            // style={".."}
            else if (expressionPath && expressionPath.isStringLiteral()) {
              attrs.push(t.objectProperty(t.identifier("style"), expressionPath.node));
            }
            // style={`a: ${b}px`}
            else {
              /* istanbul ignore else */
              if (expressionPath && expressionPath.isExpression()) {
                if (exprCall(expressionPath, expressionPath.node, internal, { strong: true }, expressionPath.node)) {
                  internal.reportError("This will slow down your application", attrPath.node);
                }

                attrs.push(t.objectProperty(t.identifier("style"), expressionPath.node));
              }
            }
          } else if (name.name === "callback" && expressionPath && expressionPath.isExpression()) {
            meshExpression(expressionPath, internal);
            callback = expressionPath.node;
          } else {
            if (expressionPath && expressionPath.isExpression()) {
              exprCall(expressionPath, expressionPath.node, internal, {}, expressionPath.node);
              attrs.push(idToProp(name, expressionPath.node));
            } else if (t.isStringLiteral(attr.value)) {
              attrs.push(idToProp(name, attr.value));
            } else {
              attrs.push(idToProp(name, t.booleanLiteral(true)));
            }
          }
        }
        if (t.isJSXNamespacedName(name)) {
          if (name.namespace.name === "bind") {
            let pushed = false;

            if (expressionPath) {
              /* istanbul ignore else */
              if (expressionPath.isExpression()) {
                exprCall(expressionPath, expressionPath.node, internal, { strong: true }, expressionPath.node);
                bind.push(idToProp(name.name, expressionPath.node));
                pushed = true;
              }
            } else {
              /* istanbul ignore else */
              if (t.isStringLiteral(attr.value)) {
                bind.push(idToProp(name.name, attr.value));
                pushed = true;
              }
            }
            if (!pushed) {
              bind.push(idToProp(name.name, t.booleanLiteral(true)));
            }
          } else {
            err(Errors.ParserError, attrPath, "Only bind namespace is supported", internal);
          }
        }
      } else {
        err(Errors.ParserError, attrPath, "Spread attribute is not allowed on HTML tags", internal);
      }
    }

    if (classStatic.length > 0) {
      const first = classStatic[0];
      const value =
        classStatic.length === 1 ? classStatic[0] : t.stringLiteral(classStatic.map(item => item.value).join(" "));

      value.loc = first.loc;

      attrs.push(t.objectProperty(t.identifier("class"), value));
    }
    if (styleStatic.length > 0) {
      attrs.push(
        t.objectProperty(
          t.identifier("style"),
          t.stringLiteral(styleStatic.map(([id, value]) => `${id.name}:${value.value}`).join(";")),
        ),
      );
    }

    const statements = transformJsxArray(path.get("children"), internal);
    const call = t.callExpression(t.memberExpression(ctx, t.identifier("tag")), [
      t.stringLiteral(name.name),
      t.objectExpression([
        ...(attrs.length > 0 ? [t.objectProperty(t.identifier("a"), t.objectExpression(attrs))] : []),
        ...(events.length > 0 ? [t.objectProperty(t.identifier("e"), t.objectExpression(events))] : []),
        ...(bind.length > 0 ? [t.objectProperty(t.identifier("b"), t.objectExpression(bind))] : []),
        ...(classElements.length > 0 || classObject.length
          ? [
              t.objectProperty(
                t.identifier("c"),
                t.arrayExpression([
                  ...classElements,
                  ...(classObject.length > 0 ? [t.objectExpression(classObject)] : []),
                ]),
              ),
            ]
          : []),
        ...(styleObject.length > 0 ? [t.objectProperty(t.identifier("s"), t.objectExpression(styleObject))] : []),
        ...(callback ? [t.objectProperty(t.identifier("k"), callback)] : []),
        ...(internal.devLayer ? [t.objectProperty(t.identifier("usage"), nodeToStaticPosition(path.node))] : []),
      ]),
      ...(statements.length > 0 ? [t.arrowFunctionExpression([ctx], t.blockStatement(statements))] : []),
    ]);

    call.loc = path.node.loc;

    return [...processConditions(conditions, internal), t.expressionStatement(call)];
  }
  if (t.isJSXIdentifier(name)) {
    const element = path.node;
    const opening = path.get("openingElement");
    const props: (types.ObjectProperty | types.SpreadElement)[] = [];
    const attrs = new Map<string, NodePath<types.Expression>>();
    let run: types.FunctionExpression | types.ArrowFunctionExpression | undefined;
    const mapped = internal.mapping.get(name.name);

    for (const attrPath of opening.get("attributes")) {
      const attr = attrPath.node;

      // <A prop=../>
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        const valuePath = attrPath.isJSXAttribute() && attrPath.get("value");
        const needReactive = attr.name.name.startsWith("$");
        // <A prop=".."/>
        if (valuePath && valuePath.isStringLiteral()) {
          props.push(
            idToProp(attr.name, needReactive ? internal.ref(valuePath.node, attr, undefined) : valuePath.node),
          );
          attrs.set(attr.name.name, valuePath);
        }
        // <A prop={..}/>
        else if (valuePath && valuePath.isJSXExpressionContainer()) {
          const isSystem = internal.mapping.has(name.name);
          const requiresReactive = attr.name.name.startsWith("$");
          // lixcode: don't alter conditions
          const acceptPassive =
            !requiresReactive || ((mapped === "If" || mapped === "ElseIf") && attr.name.name === "$condition");
          const prechecked =
            !!mapped &&
            mapped in strongSlotMap &&
            attr.name.name === "slot" &&
            precheckSlotParams(mapped, valuePath, internal);
          const value = transformJsxExpressionContainer(
            valuePath,
            internal,
            !isSystem || attr.name.name === "slot",
            isSystem && attr.name.name === "slot",
            requiresReactive,
            acceptPassive,
            prechecked,
          );
          const exprPath = valuePath.get("expression");

          props.push(idToProp(attr.name, value));
          /* istanbul ignore else */
          if (exprPath.isExpression()) {
            attrs.set(attr.name.name, exprPath);
          }
        } else {
          /* istanbul ignore else */
          if (!attr.value) {
            props.push(
              idToProp(
                attr.name,
                needReactive ? internal.ref(t.booleanLiteral(true), attr, undefined) : t.booleanLiteral(true),
              ),
            );
          }
        }
      }
      // <A {...arg}/>
      else if (attrPath.isJSXSpreadAttribute()) {
        meshExpression(attrPath.get("argument"), internal);
        props.push(t.spreadElement(attrPath.node.argument));

        if (mapped === "If" || mapped === "ElseIf" || mapped === "Else") {
          err(
            Errors.RulesOfVasille,
            attrPath,
            "If, Else and ElseIf are syntax sugar, use Switch if you need more runtime elasticity",
            internal,
          );
        }
      }
      // <A space:name=../>
      else {
        err(Errors.ParserError, attrPath, "Namespaced attributes names are not supported", internal);
      }
    }

    const filteredChildren = element.children.filter(item => {
      if (!t.isJSXText(item)) {
        return true;
      }

      return !textIsSpacesOnly(item);
    });
    const isInternal = internal.mapping.has(name.name);

    const statements = transformJsxArray(path.get("children"), internal);

    if (statements.length > 0) {
      const params: types.Identifier[] = [ctx];

      if (!isInternal) {
        params.unshift(t.identifier(`_${internal.prefix}`));
      }

      run = t.arrowFunctionExpression(params, t.blockStatement(statements));
    }

    const ret: types.Statement[] = [];
    const filter = (v: types.Node | null | undefined): v is types.ObjectProperty => {
      return t.isObjectProperty(v);
    };

    if (mapped === "If" || mapped === "ElseIf" || mapped === "Else") {
      const condition = attrs.get("$condition");
      const slot =
        run ??
        props.filter(filter).find(prop => {
          return t.isIdentifier(prop.key) && prop.key.name === "slot";
        })?.value;

      if (mapped === "If") {
        ret.push(...processConditions(conditions, internal));
      }
      if ((mapped === "ElseIf" || mapped === "Else") && !conditions.cases) {
        err(Errors.RulesOfVasille, path, "Malformed JSX If tag is missing", internal);
      }
      if (mapped === "If" || mapped === "ElseIf") {
        /* istanbul ignore else */
        if (condition?.isExpression() && (t.isFunctionExpression(slot) || t.isArrowFunctionExpression(slot))) {
          const reactive = exprCall(condition, condition.node, internal, {}, condition.node);

          if (!conditions.cases) {
            conditions.cases = [{ reactive, condition: condition.node, slot }];
          } else {
            conditions.cases.push({ reactive, condition: condition.node, slot });
          }
        }
      }
      if (mapped === "Else") {
        ret.push(
          ...processConditions(
            conditions,
            internal,
            t.isFunctionExpression(slot) || t.isArrowFunctionExpression(slot) ? slot : undefined,
          ),
        );
      }

      return ret;
    }
    if (internal.shadow && mapped === "Slot") {
      const model = props.find(
        item => t.isObjectProperty(item) && t.isIdentifier(item.key) && item.key.name === "model",
      );
      const modelName =
        t.isObjectProperty(model) &&
        ((t.isIdentifier(model.value) && model.value.name) ||
          ((t.isMemberExpression(model.value) || t.isOptionalMemberExpression(model.value)) &&
            t.isIdentifier(model.value.property) &&
            model.value.property.name));
      const call = t.callExpression(t.memberExpression(ctx, t.identifier("tag")), [
        t.stringLiteral("slot"),
        t.objectExpression(
          modelName && modelName !== "slot"
            ? [
                t.objectProperty(
                  t.identifier("a"),
                  t.objectExpression([t.objectProperty(t.identifier("name"), t.stringLiteral(modelName))]),
                ),
              ]
            : [],
        ),
        ...(run ? [run] : []),
      ]);

      run = t.arrowFunctionExpression([ctx], call);
    }
    if (mapped === "Iterate") {
      const value = attrs.get("value")?.node;
      const slot = attrs.get("slot")?.node;

      if (
        value &&
        slot &&
        (t.isFunctionExpression(slot) || t.isArrowFunctionExpression(slot)) &&
        slot.params.length === 2 &&
        (t.isIdentifier(slot.params[1]) || t.isArrayPattern(slot.params[1]) || t.isObjectPattern(slot.params[1]))
      ) {
        return [
          ...ret,
          t.forOfStatement(
            t.variableDeclaration("const", [t.variableDeclarator(slot.params[1])]),
            value,
            t.isExpression(slot.body) ? t.expressionStatement(slot.body) : slot.body,
          ),
        ];
      } else {
        err(Errors.RulesOfVasille, path, "Malformed JSX Iterate tag must have value and slot with 1 param", internal);
      }
    }
    if (mapped === "ForEach") {
      const value = attrs.get("value")?.node;
      const slot = attrs.get("slot")?.node;

      if (value && slot && (t.isFunctionExpression(slot) || t.isArrowFunctionExpression(slot))) {
        slot.params.shift();
        return [
          ...ret,
          t.expressionStatement(t.callExpression(t.memberExpression(value, t.identifier("forEach")), [slot])),
        ];
      } else {
        err(Errors.RulesOfVasille, path, "Malformed JSX ForEach tag must have value and slot", internal);
      }
    }

    const localComponentName = internal.shadow && internal.componentsImports.get(name.name);
    const call = localComponentName
      ? t.callExpression(t.memberExpression(ctx, t.identifier("tag")), [
          t.stringLiteral(toKebabCase(localComponentName)),
          t.objectExpression([t.objectProperty(t.identifier("b"), t.objectExpression(props))]),
          ...(run ? [run] : []),
        ])
      : t.callExpression(t.identifier(name.name), [
          t.objectExpression(props),
          ctx,
          ...(run ? [run] : internal.devLayer ? [t.buildUndefinedNode()] : []),
          ...(internal.devLayer ? [nodeToStaticPosition(path.node)] : []),
        ]);

    call.loc = path.node.loc;

    return [...ret, t.expressionStatement(call)];
  }

  return err(
    Errors.ParserError,
    path,
    "Unsupported tag detected, html lowercase tag names and components are accepted",
    internal,
    [],
  );
}

function precheckSlotParams(mapped: string, node: NodePath<types.JSXExpressionContainer>, internal: Internal): true {
  const args = strongSlotMap[mapped as keyof typeof strongSlotMap];
  const slot = node.get("expression");

  if (slot && (slot.isFunctionExpression() || slot.isArrowFunctionExpression())) {
    // this structure fix inferred type
    const params = slot.isFunctionExpression() ? slot.get("params") : slot.get("params");

    if (params.length > args.length) {
      err(Errors.ParserError, slot, `The ${mapped} slot must have ${args.length} arguments or less`, internal);
    }

    for (let i = 0; i < params.length && i < args.length; i++) {
      const param = params[i];

      if (args[i] === "reactive") {
        if (!param.isIdentifier()) {
          err(Errors.ParserError, slot, `The ${mapped} slot must have only identifiers as parameters`, internal);
        } else {
          checkReactiveName(param, internal);
        }
      } else {
        /* istanbul ignore else */
        if (param.isIdentifier()) {
          checkNonReactiveName(param, internal);
        }
      }
    }
  } else {
    err(Errors.ParserError, slot, "The slot must be a function expression", internal);
  }

  return true;
}
