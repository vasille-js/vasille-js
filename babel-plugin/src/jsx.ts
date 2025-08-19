import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { calls } from "./call";
import { ctx, Internal } from "./internal.js";
import { bodyHasJsx } from "./jsx-detect.js";
import { err, Errors, exprCall } from "./lib.js";
import { compose, meshExpression } from "./mesh.js";

export interface ConditionCollection {
  cases: { condition: types.Expression; slot: types.FunctionExpression | types.ArrowFunctionExpression }[] | null;
}

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

export function transformJsxArray(
  paths: NodePath<
    types.JSXText | types.JSXExpressionContainer | types.JSXSpreadChild | types.JSXElement | types.JSXFragment
  >[],
  internal: Internal,
): types.Statement[] {
  const result: types.Statement[] = [];
  const conditions: ConditionCollection = { cases: null };

  paths.forEach(path => {
    if (!path.isJSXElement()) {
      result.push(...processConditions(conditions, internal));
    }

    if (path.isJSXElement() || path.isJSXFragment()) {
      result.push(...transformJsx(path, conditions, internal));
    } else if (path.isJSXText()) {
      if (!/^\s+$/.test(path.node.value)) {
        const fixed = path.node.value
          .replace(/\n\s+$/m, "")
          .replace(/^\s*\n\s+/m, "")
          .replace(/\s*\n\s*/gm, "\n");
        const call = t.callExpression(t.memberExpression(ctx, t.identifier("text")), [t.stringLiteral(fixed)]);

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
      const value = transformJsxExpressionContainer(path, internal, false, false, true, true);
      const call = t.callExpression(t.memberExpression(ctx, t.identifier("text")), [value]);

      call.loc = value.loc;
      result.push(t.expressionStatement(call));
    } else {
      err(Errors.TokenNotSupported, path, "Spread child is not supported", internal);
    }
  });

  result.push(...processConditions(conditions, internal));

  return result;
}

function transformJsxExpressionContainer(
  path: NodePath<types.JSXExpressionContainer>,
  internal: Internal,
  acceptSlots: boolean,
  isInternalSlot: boolean,
  acceptsReactive: boolean,
  acceptsRaw: boolean,
): types.Expression {
  const expression = path.get("expression");
  const loc = expression.node.loc;

  if (
    acceptSlots &&
    (expression.isFunctionExpression() || expression.isArrowFunctionExpression()) &&
    bodyHasJsx(expression.node.body)
  ) {
    compose(expression, internal, isInternalSlot, true);

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

  if (expression.isExpression()) {
    if (acceptsReactive) {
      // cals backward
      if (calls(expression, ["backward"], internal)) {
        const argPath = (expression as NodePath<types.CallExpression>).get("arguments")[0];

        if (argPath && argPath.isExpression()) {
          const argValue = argPath.node;

          if (exprCall(argPath, argPath.node, internal, {strong: true})) {
            path.replaceWith(argPath);

            if (!argPath.isMemberExpression() && !argPath.isIdentifier()) {
              argPath.node = argValue;
              err(
                Errors.RulesOfVasille,
                argPath,
                "A reactive variable or object field expected, reactive expression are forward only",
                internal,
              );
            }
          } else {
            argPath.node = argValue;
            err(Errors.RulesOfVasille, argPath, "The backward argument is not reactive", internal);
          }
        }
      }
      // calls forward
      else if (calls(expression, ["forward"], internal)) {
        const argPath = (expression as NodePath<types.CallExpression>).get("arguments")[0];

        if (argPath && argPath.isExpression()) {
          const argValue = argPath.node;

          if (!exprCall(expression, expression.node, internal, {strong: true})) {
            argPath.node = argValue;
            err(Errors.RulesOfVasille, argPath, "A reactive expression expected, argument value constant", internal);
          }
        }
      }
      // two-side binding
      else {
        const isReactive = exprCall(expression, expression.node, internal, {strong: !acceptsRaw});

        if (!isReactive && !acceptsRaw) {
          expression.replaceWith(internal.ref(expression.node));
        }
      }
    } else {
      meshExpression(expression, internal);
    }
  }

  expression.node.loc = loc;

  return expression.isExpression() ? expression.node : t.booleanLiteral(true);
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

export function processConditions(
  conditions: ConditionCollection,
  internal: Internal,
  _default?: types.FunctionExpression | types.ArrowFunctionExpression,
): types.Statement[] {
  if (!conditions.cases) {
    return [];
  }

  const ret = [
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
    const opening = path.get("openingElement");
    const attrs: types.ObjectProperty[] = [];
    const events: types.ObjectProperty[] = [];
    const bind: types.ObjectProperty[] = [];
    const classElements: types.ArrayExpression["elements"] = [];
    const classObject: (types.ObjectProperty | types.SpreadElement)[] = [];
    const classStatic: types.StringLiteral[] = [];
    const styleObject: (types.ObjectProperty | types.SpreadElement)[] = [];
    const styleStatic: [types.Identifier, types.StringLiteral][] = [];

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
              err(Errors.TokenNotSupported, valuePath, "Expected event handler", internal);
            }
          } else if (name.name === "class") {
            // class={[..]}
            /* istanbul ignore else */
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
                    exprCall(elementPath.get("left"), elementPath.node.left, internal, {});

                    classObject.push(idToProp(elementPath.node.right, elementPath.node.left));
                  }
                  // class={[{..}]}
                  else if (elementPath.isObjectExpression()) {
                    for (const propPath of elementPath.get("properties")) {
                      // class={[{a: b}]}
                      if (propPath.isObjectProperty()) {
                        const keyPath = propPath.get("key");
                        const valuePath = propPath.get("value");

                        if (valuePath.isExpression()) {
                          exprCall(valuePath, valuePath.node, internal, {});
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
                    exprCall(elementPath, elementPath.node, internal, {strong: true});

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
              if (exprCall(expressionPath, expressionPath.node, internal, {strong: true})) {
                console.warn(attrPath.buildCodeFrameError("Vasille: This will slow down your application"));
              }

              attrs.push(t.objectProperty(t.identifier("class"), expressionPath.node));
            }
            // class={name}
            else if (expressionPath && expressionPath.isExpression()) {
              exprCall(expressionPath, expressionPath.node, internal, {});
              attrs.push(t.objectProperty(t.identifier("class"), expressionPath.node));
            }
            // class="a b"
            else if (valuePath.isStringLiteral()) {
              classStatic.push(valuePath.node);
            }
          } else if (name.name === "style") {
            // style={{..}}
            /* istanbul ignore else */
            if (expressionPath && expressionPath.isObjectExpression()) {
              for (const propPath of expressionPath.get("properties")) {
                // style={{a: b}}
                if (propPath.isObjectProperty()) {
                  const prop = propPath;
                  const valuePath = prop.get("value");

                  if (valuePath.isExpression()) {
                    exprCall(valuePath, valuePath.node, internal, {strong: true});
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
            else if (expressionPath && expressionPath.isExpression()) {
              if (exprCall(expressionPath, expressionPath.node, internal, {strong: true})) {
                console.warn(attrPath.buildCodeFrameError("Vasille: This will slow down your application"));
              }

              attrs.push(t.objectProperty(t.identifier("style"), expressionPath.node));
            }
          } else {
            /* istanbul ignore else */
            if (expressionPath && expressionPath.isExpression()) {
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

            /* istanbul ignore else */
            if (expressionPath) {
              if (expressionPath.isExpression()) {
                exprCall(expressionPath, expressionPath.node, internal, {strong: true});
                bind.push(idToProp(name.name, expressionPath.node));
                pushed = true;
              }
            } else if (t.isStringLiteral(attr.value)) {
              bind.push(idToProp(name.name, attr.value));
              pushed = true;
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
        ...(attrs.length > 0 ? [t.objectProperty(t.identifier("attr"), t.objectExpression(attrs))] : []),
        ...(events.length > 0 ? [t.objectProperty(t.identifier("events"), t.objectExpression(events))] : []),
        ...(bind.length > 0 ? [t.objectProperty(t.identifier("bind"), t.objectExpression(bind))] : []),
        ...(classElements.length > 0 || classObject.length
          ? [
              t.objectProperty(
                t.identifier("class"),
                t.arrayExpression([
                  ...classElements,
                  ...(classObject.length > 0 ? [t.objectExpression(classObject)] : []),
                ]),
              ),
            ]
          : []),
        ...(styleObject.length > 0 ? [t.objectProperty(t.identifier("style"), t.objectExpression(styleObject))] : []),
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
    let run: types.FunctionExpression | types.ArrowFunctionExpression | undefined;
    const mapped = internal.mapping.get(name.name);

    if (mapped === "Debug" && internal.stack.get(name.name) === undefined && !internal.devMode) {
      return processConditions(conditions, internal);
    }

    for (const attrPath of opening.get("attributes")) {
      const attr = attrPath.node;

      // <A prop=../>
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        const valuePath = attrPath.isJSXAttribute() && attrPath.get("value");
        const needReactive = attr.name.name.startsWith("$");
        // <A prop=".."/>
        /* istanbul ignore else */
        if (t.isStringLiteral(attr.value)) {
          props.push(idToProp(attr.name, needReactive ? internal.ref(attr.value) : attr.value));
        }
        // <A prop={..}/>
        else if (valuePath && valuePath.isJSXExpressionContainer()) {
          const isSystem = internal.mapping.has(name.name);
          const requiresReactive = attr.name.name.startsWith("$");
          const value = transformJsxExpressionContainer(
            valuePath,
            internal,
            !isSystem || attr.name.name === "slot",
            isSystem && attr.name.name === "slot",
            requiresReactive,
            !requiresReactive,
          );

          props.push(idToProp(attr.name, value));
        } else if (!attr.value) {
          props.push(idToProp(attr.name, needReactive ? internal.ref(t.booleanLiteral(true)) : t.booleanLiteral(true)));
        }
      }
      // <A {...arg}/>
      else if (attrPath.isJSXSpreadAttribute()) {
        meshExpression(attrPath.get("argument"), internal);
        props.push(t.spreadElement(attrPath.node.argument));

        if (mapped === "If" || mapped === "ElseIf" || mapped === "Else") {
          err(Errors.RulesOfVasille, attrPath, "If, Else and ElseIf are syntax sugar, use Switch if you need more runtime elasticity", internal);
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

      return !!item.value.trim();
    });
    const isInternal = internal.mapping.has(name.name);

    // The child is a slot value
    if (
      filteredChildren.length === 1 &&
      t.isJSXExpressionContainer(filteredChildren[0]) &&
      (t.isFunctionExpression(filteredChildren[0].expression) ||
        t.isArrowFunctionExpression(filteredChildren[0].expression))
    ) {
      transformJsxExpressionContainer(
        path.get("children")[element.children.indexOf(filteredChildren[0])] as NodePath<types.JSXExpressionContainer>,
        internal,
        true,
        isInternal,
        false,
        true,
      );
      run = filteredChildren[0].expression;
    } else {
      const statements = transformJsxArray(path.get("children"), internal);

      if (statements.length > 0) {
        const params: types.Identifier[] = [ctx];

        if (!isInternal) {
          params.unshift(t.identifier(`_${internal.prefix}`));
        }

        run = t.arrowFunctionExpression(params, t.blockStatement(statements));
      }
    }

    const ret: types.Statement[] = [];
    const filter = (v: types.Node | null | undefined): v is types.ObjectProperty => {
      return t.isObjectProperty(v);
    };

    if (mapped === "If" || mapped === "ElseIf" || mapped === "Else") {
      const condition = props.filter(filter).find(prop => {
        return t.isStringLiteral(prop.key) && prop.key.value === "$condition";
      })?.value;
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
        if (t.isExpression(condition) && (t.isFunctionExpression(slot) || t.isArrowFunctionExpression(slot))) {
          if (!conditions.cases) {
            conditions.cases = [{ condition, slot }];
          } else {
            conditions.cases.push({ condition, slot });
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

    const call = t.callExpression(t.identifier(name.name), [t.objectExpression(props), ctx, ...(run ? [run] : [])]);

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
