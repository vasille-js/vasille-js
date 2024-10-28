import { types } from "@babel/core";
import * as t from "@babel/types";

export function exprHasJsx(node: types.Expression): boolean {
  if (t.isBinaryExpression(node)) {
    return t.isExpression(node.left) && exprHasJsx(node.left) || exprHasJsx(node.right);
  }
  if (t.isConditionalExpression(node)) {
    return exprHasJsx(node.consequent) || exprHasJsx(node.alternate);
  }
  if (t.isLogicalExpression(node)) {
    return exprHasJsx(node.left) || exprHasJsx(node.right);
  }
  if (t.isSequenceExpression(node)) {
    return node.expressions.some(item => exprHasJsx(item));
  }
  if (t.isParenthesizedExpression(node)) {
    return exprHasJsx(node.expression);
  }
  if (t.isDoExpression(node)) {
    return bodyHasJsx(node.body);
  }

  return t.isJSXElement(node) || t.isJSXFragment(node);
}

export function statementHasJsx(statement: types.Statement): boolean {
  if (t.isExpressionStatement(statement)) {
    return exprHasJsx(statement.expression);
  }
  if (t.isBlockStatement(statement)) {
    return bodyHasJsx(statement);
  }
  if (t.isDoWhileStatement(statement)) {
    return statementHasJsx(statement.body);
  }
  if (t.isForInStatement(statement)) {
    return statementHasJsx(statement.body);
  }
  if (t.isSwitchStatement(statement)) {
    return statement.cases.some(_case => {
      return _case.consequent.some(statementHasJsx);
    })
  }
  if (t.isWhileStatement(statement)) {
    return statementHasJsx(statement.body);
  }
  if (t.isForOfStatement(statement)) {
    return statementHasJsx(statement.body);
  }
  if (t.isLabeledStatement(statement)) {
    return statementHasJsx(statement.body);
  }
  if (t.isReturnStatement(statement)) {
    return !!statement.argument && exprHasJsx(statement.argument);
  }

  return false;
}

export function bodyHasJsx (node: types.BlockStatement | types.Expression): boolean {
  if (t.isExpression(node)) {
    return exprHasJsx(node);
  }

  return node.body.some(statementHasJsx);
}