import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal } from "./internal";

export type FnNames = "compose" | "extend" | "awaited" | "calculate" | "ensureIValue" | "forward" | "point" | "watch";

export function calls(node: types.Expression, names: FnNames[], internal: Internal) {
    const set = new Set<string>(names);
    const callee = t.isCallExpression(node) ? node.callee : null;

    if (callee) {
        if (t.isIdentifier(callee)) {
            const mapped = internal.mapping.get(callee.name);

            return mapped && set.has(mapped) && internal.stack.get(callee.name) === undefined;
        }

        // The global object is overrided
        if (internal.stack.get(internal.global) !== undefined) {
            return false;
        }

        const propName = t.isMemberExpression(callee)
            ? t.isIdentifier(callee.property)
                ? callee.property.name
                : t.isStringLiteral(callee.property)
                  ? callee.property.value
                  : null
            : null;

        if (t.isMemberExpression(callee) && t.isIdentifier(callee.object) && propName) {
            return callee.object.name === internal.global && set.has(propName);
        }
    }

    return false;
}
