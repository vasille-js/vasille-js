import { types } from "@babel/core";
import * as t from "@babel/types";

export function exprHasJsx(node: types.Expression): boolean {
  return t.isJSXElement(node) || t.isJSXFragment(node);
}

export function bodyHasJsx(node: types.BlockStatement | types.Expression): boolean {
  if (t.isExpression(node)) {
    return exprHasJsx(node);
  }

  return node.body.some(statement => {
    return t.isExpressionStatement(statement) && exprHasJsx(statement.expression);
  });
}
