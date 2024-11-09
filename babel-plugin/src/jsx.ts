import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, ctx } from "./internal";
import { exprCall } from "./lib";
import { compose, meshExpression } from "./mesh";
import { bodyHasJsx } from "./jsx-detect";

export function transformJsx(
  path: NodePath<types.JSXElement | types.JSXFragment>,
  internal: Internal,
): types.Statement {
  if (t.isJSXElement(path.node)) {
    return transformJsxElement(path as NodePath<types.JSXElement>, internal);
  }

  throw path.buildCodeFrameError("Vasille: Support missing");
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

    return t.isFunctionExpression(path.node.expression)
      ? path.node.expression
      : t.functionExpression(
          null,
          path.node.expression.params,
          t.isBlockStatement(path.node.expression.body)
            ? path.node.expression.body
            : t.blockStatement([t.returnStatement(path.node.expression.body)]),
        );
  }

  const call = exprCall(path.get("expression") as NodePath<types.Expression>, path.node.expression, internal);

  return call ?? path.node.expression;
}

function id(str: string) {
  if (/^[\w_]+$/.test(str)) {
    return t.identifier(str);
  } else {
    return t.stringLiteral(str);
  }
}

function transformJsxElement(path: NodePath<types.JSXElement>, internal: Internal): types.ExpressionStatement {
  const name = path.node.openingElement.name;

  if (t.isJSXIdentifier(name) && name.name[0].toLowerCase() === name.name[0]) {
    const opening = path.get("openingElement");
    const attrs: types.ObjectProperty[] = [];
    const events: types.ObjectProperty[] = [];
    const bind: types.ObjectProperty[] = [];
    const classElements: types.ArrayExpression["elements"] = [];
    const classObject: (types.ObjectProperty | types.SpreadElement)[] = [];
    const classStatic: string[] = [];
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

              events.push(t.objectProperty(id(name.name.substring(2)), path.node.expression as types.Expression));
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

                    classObject.push(t.objectProperty(id(item.right.value), call ?? item.left));
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
                    classStatic.push(elementPath.node.value);
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
              const splitted = attr.value.value.split(" ");

              for (const item of splitted) {
                classStatic.push(item);
              }
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
                t.objectProperty(
                  id(name.name),
                  t.isExpression(attr.value.expression) ? attr.value.expression : t.booleanLiteral(true),
                ),
              );
            } else if (t.isStringLiteral(attr.value)) {
              attrs.push(t.objectProperty(id(name.name), attr.value));
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
                t.objectProperty(
                  id(name.name.name),
                  value ?? (t.isExpression(attr.value.expression) ? attr.value.expression : t.booleanLiteral(true)),
                ),
              );
            } else if (t.isStringLiteral(attr.value)) {
              bind.push(t.objectProperty(id(name.name.name), attr.value));
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
      attrs.push(t.objectProperty(t.identifier("class"), t.stringLiteral(classStatic.join(" "))));
    }
    if (styleStatic.length > 0) {
      attrs.push(
        t.objectProperty(
          t.identifier("style"),
          t.stringLiteral(styleStatic.map(([id, value]) => `${id.name}:${value.value}`).join(";")),
        ),
      );
    }

    return t.expressionStatement(
      t.callExpression(t.memberExpression(ctx, t.identifier("tag")), [
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
      ]),
    );
  }

  throw new Error("Not supported");
}
