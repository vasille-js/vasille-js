import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal } from "./internal";

export type FnNames =
    | "compose"
    | "extend"
    | "awaited"
    | "calculate"
    | "ensureIValue"
    | "forward"
    | "watch"
    | "ref"
    | "bind"
    | "value";

export const requiresThis: FnNames[] = ["awaited", "calculate", "ensureIValue", "forward", "watch"];
const requiresThisSet: Set<string> = new Set(requiresThis);

export function calls(node: types.Expression | null | undefined, names: FnNames[], internal: Internal) {
    const set = new Set<string>(names);
    const callee = t.isCallExpression(node) ? node.callee : null;

    if (callee) {
        if (t.isIdentifier(callee)) {
            const mapped = internal.mapping.get(callee.name);

            if (mapped && set.has(mapped) && internal.stack.get(callee.name) === undefined) {
                if (requiresThisSet.has(callee.name) && t.isCallExpression(node)) {
                    node.arguments.unshift(t.thisExpression());
                }
                return mapped;
            }
            return false;
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
            if (callee.object.name === internal.global && set.has(propName)) {
                if (requiresThisSet.has(callee.object.name) && t.isCallExpression(node)) {
                    node.arguments.unshift(t.thisExpression());
                }
                return callee.object.name;
            }
        }
    }

    return false;
}
