import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { checkNode, encodeName } from "./expression";
import { Internal } from "./internal";

export function exprCall(
    path: NodePath<types.Expression | null | undefined>,
    expr: types.Expression | null | undefined,
    internal: Internal,
) {
    const exprData = checkNode(path, internal);

    return exprData.self
        ? exprData.self
        : exprData.found.size > 0 && expr
          ? t.callExpression(t.memberExpression(t.thisExpression(), t.identifier("expr")), [
                t.arrowFunctionExpression(
                    [...exprData.found.keys()].map(name => encodeName(name)),
                    expr,
                ),
                ...exprData.found.values(),
            ])
          : null;
}

export function forwardOnlyExpr(
    path: NodePath<types.Expression | null | undefined>,
    expr: types.Expression | null | undefined,
    internal: Internal,
) {
    const exprData = checkNode(path, internal);

    return exprData.self
        ? t.callExpression(t.memberExpression(internal.id, t.identifier("fo")), [exprData.self])
        : exprData.found.size > 0 && expr
          ? t.callExpression(t.memberExpression(internal.id, t.identifier("ex")), [
                t.arrowFunctionExpression(
                    [...exprData.found.keys()].map(name => encodeName(name)),
                    expr,
                ),
                ...exprData.found.values(),
            ])
          : null;
}

export function own(expr: types.Expression) {
    return t.callExpression(t.memberExpression(t.thisExpression(), t.identifier("own")), [expr]);
}

export function ref(expr: types.Expression | null | undefined) {
    return t.callExpression(t.memberExpression(t.thisExpression(), t.identifier("ref")), expr ? [expr] : []);
}
