import { types } from "@babel/core";
import * as t from "@babel/types";

export function exprHasJsx(node: types.Expression): boolean {
  return t.isJSXElement(node) || t.isJSXFragment(node);
}

export function statementHasJsx(statement: types.Statement): boolean {
  if (t.isExpressionStatement(statement)) {
    return exprHasJsx(statement.expression);
  }
  if (t.isBlockStatement(statement)) {
    return bodyHasJsx(statement);
  }

  return false;
}

export function bodyHasJsx(node: types.BlockStatement | types.Expression): boolean {
  if (t.isExpression(node)) {
    return exprHasJsx(node);
  }

  return node.body.some(statementHasJsx);
}
