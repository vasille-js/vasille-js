import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, VariableState, ctx } from "./internal";
import { exprCall } from "./lib";
import { compose, meshExpression } from "./mesh";
import { bodyHasJsx } from "./jsx-detect";

export function transformJsx(
  path: NodePath<types.JSXElement | types.JSXFragment>,
  internal: Internal,
): types.Statement[] {
  if (t.isJSXElement(path.node)) {
    return [transformJsxElement(path as NodePath<types.JSXElement>, internal)];
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

  for (const path of paths) {
    if (t.isJSXElement(path.node) || t.isJSXFragment(path.node)) {
      result.push(...transformJsx(path as NodePath<types.JSXElement | types.JSXFragment>, internal));
    } else if (t.isJSXText(path.node)) {
      if (!/^\s+$/.test(path.node.value)) {
        const fixed = path.node.value
          .replace(/\n\s+$/m, "")
          .replace(/^\s*\n\s+/m, "")
          .replace(/\s*\n\s*/gm, "\n");
        const call = t.callExpression(t.memberExpression(ctx, t.identifier("text")), [t.stringLiteral(fixed)]);

        call.loc = path.node.loc;

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
    } else if (t.isJSXExpressionContainer(path.node)) {
      const value = transformJsxExpressionContainer(
        path as NodePath<types.JSXExpressionContainer>,
        internal,
        false,
        false,
      );
      const call = t.callExpression(t.memberExpression(ctx, t.identifier("text")), [value]);

      call.loc = value.loc;
      result.push(t.expressionStatement(call));
    } else {
      throw path.buildCodeFrameError("Vasille: Spread child is not supported");
    }
  }

  return result;
}

function transformJsxExpressionContainer(
  path: NodePath<types.JSXExpressionContainer>,
  internal: Internal,
  acceptSlots: boolean,
  isInternalSlot: boolean,
): types.Expression {
  if (!t.isExpression(path.node.expression)) {
    return t.booleanLiteral(true);
  }

  const loc = path.node.expression.loc;

  if (
    acceptSlots &&
    (t.isFunctionExpression(path.node.expression) || t.isArrowFunctionExpression(path.node.expression)) &&
    bodyHasJsx(path.node.expression.body)
  ) {
    compose(
      path.get("expression") as NodePath<types.FunctionExpression | types.ArrowFunctionExpression>,
      internal,
      isInternalSlot,
    );

    if (!isInternalSlot) {
      if (path.node.expression.params.length < 1) {
        path.node.expression.params.push(t.identifier(internal.prefix));
      }
      path.node.expression.params.push(ctx);
    } else {
      path.node.expression.params.unshift(ctx);
    }

    path.node.expression.loc = loc;

    return path.node.expression;
  } else if (
    isInternalSlot &&
    (t.isFunctionExpression(path.node.expression) || t.isArrowFunctionExpression(path.node.expression))
  ) {
    path.node.expression.params.unshift(ctx);
  }

  let call = exprCall(path.get("expression") as NodePath<types.Expression>, path.node.expression, internal);

  if (
    !call &&
    t.isIdentifier(path.node.expression) &&
    internal.stack.get(path.node.expression.name) === VariableState.ReactiveObject
  ) {
    call = t.callExpression(t.memberExpression(internal.id, t.identifier("rop")), [path.node.expression]);
  }

  const result = call ?? path.node.expression;

  result.loc = loc;

  return result;
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

function transformJsxElement(path: NodePath<types.JSXElement>, internal: Internal): types.Statement {
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

        if (t.isJSXIdentifier(name)) {
          if (name.name.startsWith("on")) {
            if (t.isJSXExpressionContainer(attr.value) && t.isExpression(attr.value.expression)) {
              const path = (attrPath as NodePath<types.JSXAttribute>).get(
                "value",
              ) as NodePath<types.JSXExpressionContainer>;

              if (t.isExpression(path.node.expression)) {
                meshExpression(path.get("expression") as NodePath<types.Expression>, internal);
              }

              events.push(idToProp(name, path.node.expression as types.Expression, 2));
            } else {
              throw (attrPath as NodePath<types.JSXAttribute>)
                .get("value")
                .buildCodeFrameError("Vasille: Expected event handler.");
            }
          } else if (name.name === "class") {
            // class={[..]}
            if (t.isJSXExpressionContainer(attr.value) && t.isArrayExpression(attr.value.expression)) {
              const valuePath = (attrPath as NodePath<types.JSXAttribute>).get(
                "value",
              ) as NodePath<types.JSXExpressionContainer>;
              const arrayExprPath = valuePath.get("expression") as NodePath<types.ArrayExpression>;

              for (const elementPath of arrayExprPath.get("elements")) {
                const item = elementPath.node;

                if (t.isExpression(item)) {
                  // class={[cond && "string"]}
                  if (t.isLogicalExpression(item) && item.operator === "&&" && t.isStringLiteral(item.right)) {
                    const call = exprCall(
                      (elementPath as NodePath<types.LogicalExpression>).get("left"),
                      item.left,
                      internal,
                    );

                    classObject.push(idToProp(item.right, call ?? item.left));
                  }
                  // class={[{..}]}
                  else if (t.isObjectExpression(item)) {
                    for (const propPath of (elementPath as NodePath<types.ObjectExpression>).get("properties")) {
                      // class={[{a: b}]}
                      if (t.isObjectProperty(propPath.node)) {
                        const prop = propPath as NodePath<types.ObjectProperty>;
                        const value =
                          exprCall(
                            prop.get("value") as NodePath<types.Expression>,
                            prop.node.value as types.Expression,
                            internal,
                          ) ?? (prop.node.value as types.Expression);

                        if (t.isExpression(prop.node.key) && !t.isIdentifier(prop.node.key)) {
                          meshExpression(prop.get("key") as NodePath<types.Expression>, internal);
                        }

                        classObject.push(t.objectProperty(prop.node.key, value));
                      }
                      // class={[{...a}]}
                      else if (t.isSpreadElement(propPath.node)) {
                        classObject.push(propPath.node);
                      }
                      // class={[{a(){}}]}
                      else {
                        throw propPath.buildCodeFrameError("Vasille: Methods are not alllowed here");
                      }
                    }
                  }
                  // class={[".."]}
                  else if (t.isStringLiteral(elementPath.node)) {
                    classStatic.push(elementPath.node);
                  }
                  // class={[..]}
                  else {
                    const call = exprCall(elementPath as NodePath<types.Expression>, item, internal);

                    classElements.push(call ?? item);
                  }
                }
                // class={[...array]}
                else {
                  classElements.push(elementPath.node);
                }
              }
            }
            // class={"a b"}
            else if (t.isJSXExpressionContainer(attr.value) && t.isStringLiteral(attr.value.expression)) {
              attrs.push(t.objectProperty(t.identifier("class"), attr.value.expression));
            }
            // class={`a ${b}`}
            else if (t.isJSXExpressionContainer(attr.value) && t.isTemplateLiteral(attr.value.expression)) {
              const jsxAttrPath = attrPath as NodePath<types.JSXAttribute>;
              const jsxContainerPath = jsxAttrPath.get("value") as NodePath<types.JSXExpressionContainer>;
              const value = exprCall(
                jsxContainerPath.get("expression") as NodePath<types.TemplateLiteral>,
                attr.value.expression,
                internal,
              );

              attrs.push(t.objectProperty(t.identifier("class"), value ?? attr.value.expression));
              if (value) {
                console.warn(attrPath.buildCodeFrameError("Vasille: This will slow down your application"));
              }
            }
            // class="a b"
            else if (t.isStringLiteral(attr.value)) {
              classStatic.push(attr.value);
            }
            // class=<div/>
            else {
              throw attrPath.buildCodeFrameError('Vasille: Value of "class" attribute must be an array expression');
            }
          } else if (name.name === "style") {
            // style={{..}}
            if (t.isJSXExpressionContainer(attr.value) && t.isObjectExpression(attr.value.expression)) {
              const valuePath = (attrPath as NodePath<types.JSXAttribute>).get(
                "value",
              ) as NodePath<types.JSXExpressionContainer>;
              const objectPath = valuePath.get("expression") as NodePath<types.ObjectExpression>;

              for (const propPath of objectPath.get("properties")) {
                // style={{a: b}}
                if (t.isObjectProperty(propPath.node)) {
                  const prop = propPath as NodePath<types.ObjectProperty>;
                  const value =
                    exprCall(
                      prop.get("value") as NodePath<types.Expression>,
                      prop.node.value as types.Expression,
                      internal,
                    ) ?? (prop.node.value as types.Expression);

                  if (t.isExpression(prop.node.key) && !t.isIdentifier(prop.node.key)) {
                    meshExpression(prop.get("key") as NodePath<types.Expression>, internal);
                  }

                  // style={{a: "b"}} -> static in compile time
                  if (t.isIdentifier(prop.node.key) && t.isStringLiteral(prop.node.value)) {
                    styleStatic.push([prop.node.key, prop.node.value]);
                  }
                  // style={{a: 23}} -> static in compile time
                  else if (t.isIdentifier(prop.node.key) && t.isNumericLiteral(prop.node.value)) {
                    styleStatic.push([prop.node.key, t.stringLiteral(`${prop.node.value.value}px`)]);
                  }
                  // style={{a: [1, 2, 3]}} -> static in compile time
                  else if (
                    t.isIdentifier(prop.node.key) &&
                    t.isArrayExpression(prop.node.value) &&
                    prop.node.value.elements.every(item => t.isNumericLiteral(item))
                  ) {
                    styleStatic.push([
                      prop.node.key,
                      t.stringLiteral(
                        prop.node.value.elements
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
                  throw propPath.buildCodeFrameError("Vasille: Methods are not alllowed here");
                }
              }
            }
            // style={".."}
            else if (t.isJSXExpressionContainer(attr.value) && t.isStringLiteral(attr.value.expression)) {
              attrs.push(t.objectProperty(t.identifier("style"), attr.value.expression));
            }
            // style={`a: ${b}px`}
            else if (t.isJSXExpressionContainer(attr.value) && t.isTemplateLiteral(attr.value.expression)) {
              const jsxAttrPath = attrPath as NodePath<types.JSXAttribute>;
              const jsxContainerPath = jsxAttrPath.get("value") as NodePath<types.JSXExpressionContainer>;
              const literalPath = jsxContainerPath.get("expression") as NodePath<types.TemplateLiteral>;

              const value = exprCall(literalPath, attr.value.expression, internal);

              attrs.push(t.objectProperty(t.identifier("style"), value ?? attr.value.expression));
              if (value) {
                console.warn(attrPath.buildCodeFrameError("Vasille: This will slow down your application"));
              }
            }
            // style=<div/>
            else {
              throw attrPath.buildCodeFrameError('Vasille: Value of "style" attribute must be an object expression');
            }
          } else {
            if (t.isJSXExpressionContainer(attr.value)) {
              attrs.push(
                idToProp(name, t.isExpression(attr.value.expression) ? attr.value.expression : t.booleanLiteral(true)),
              );
            } else if (t.isStringLiteral(attr.value)) {
              attrs.push(idToProp(name, attr.value));
            } else {
              throw attrPath.buildCodeFrameError("Vasille: Value of bind must be an expression or string");
            }
          }
        }
        if (t.isJSXNamespacedName(name)) {
          if (name.namespace.name === "bind") {
            if (t.isJSXExpressionContainer(attr.value)) {
              const value = t.isExpression(attr.value.expression)
                ? exprCall(
                    (attrPath as NodePath<types.JSXAttribute>).get("value") as NodePath<types.Expression>,
                    attr.value.expression,
                    internal,
                  )
                : undefined;

              bind.push(
                idToProp(
                  name.name,
                  value ?? (t.isExpression(attr.value.expression) ? attr.value.expression : t.booleanLiteral(true)),
                ),
              );
            } else if (t.isStringLiteral(attr.value)) {
              bind.push(idToProp(name.name, attr.value));
            } else {
              throw attrPath.buildCodeFrameError("Vasille: Value of bind must be an expression or string");
            }
          } else {
            throw attrPath.buildCodeFrameError("Vasille: only bind namespace is supported");
          }
        }
      } else {
        throw attrPath.buildCodeFrameError("Vasille: Spread attribute is not allowed on HTML tags.");
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

    return t.expressionStatement(call);
  }
  if (t.isJSXIdentifier(name)) {
    const element = path.node;
    const opening = path.get("openingElement");
    const props: (types.ObjectProperty | types.SpreadElement)[] = [];
    let run: types.FunctionExpression | types.ArrowFunctionExpression | undefined;
    const mapped = internal.mapping.get(name.name);

    if (mapped === "Debug" && internal.stack.get(name.name) === undefined && !internal.devMode) {
      return t.emptyStatement();
    }

    for (const attrPath of opening.get("attributes")) {
      const attr = attrPath.node;

      // <A prop=../>
      if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
        // <A prop=".."/>
        if (t.isStringLiteral(attr.value)) {
          props.push(idToProp(attr.name, attr.value));
        }
        // <A prop={..}/>
        else if (t.isJSXExpressionContainer(attr.value)) {
          const isSystem = internal.mapping.has(name.name);
          const value = transformJsxExpressionContainer(
            (attrPath as NodePath<types.JSXAttribute>).get("value") as NodePath<types.JSXExpressionContainer>,
            internal,
            !isSystem || attr.name.name === "slot",
            isSystem && attr.name.name === "slot",
          );

          props.push(idToProp(attr.name, value));
        } else {
          throw attrPath.buildCodeFrameError("Vasille: JSX Elements/Fragments are not supported here");
        }
      }
      // <A {...arg}/>
      else if (t.isJSXSpreadAttribute(attr)) {
        props.push(t.spreadElement(attr.argument));
      }
      // <A space:name=../>
      else {
        throw attrPath.buildCodeFrameError("Vasille: Namespaced attributes names are not supported");
      }
    }

    if (
      element.children.length === 1 &&
      t.isJSXExpressionContainer(element.children[0]) &&
      (t.isFunctionExpression(element.children[0].expression) ||
        t.isArrowFunctionExpression(element.children[0].expression))
    ) {
      run = element.children[0].expression;
      run.params.push(ctx);
    } else {
      const statements = transformJsxArray(path.get("children"), internal);

      if (statements.length > 0) {
        run = t.arrowFunctionExpression([ctx], t.blockStatement(statements));
      }
    }

    const call = t.callExpression(t.identifier(name.name), [ctx, t.objectExpression(props), ...(run ? [run] : [])]);

    call.loc = path.node.loc;

    return t.expressionStatement(call);
  }

  throw path.buildCodeFrameError(
    "Vasille: Unsupported tag detected, html lowercase tagnames and components are accepted",
  );
}
