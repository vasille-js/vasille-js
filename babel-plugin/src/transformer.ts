import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, StackedStates, VariableState } from "./internal";
import { dereference, dereferenceStatement } from "./dereference";

const imports = new Map([["vasille-dx", "VasilleDX"]]);

function extractText(node: types.Identifier | types.StringLiteral) {
    return t.isIdentifier(node) ? node.name : node.value;
}

// function possibleModel(expr: types.Expression, internal: Internal) {
//     if (t.isArrayExpression(expr)) {
//         return t.callExpression(t.memberExpression(internal.id, t.identifier("am")), [
//             t.arrayExpression(
//                 expr.elements.map(item => {
//                     if (t.isExpression(item)) {
//                         return dereference(item, internal);
//                     }

//                     if (t.isSpreadElement(item)) {
//                         return t.spreadElement(dereference(item.argument, internal));
//                     }

//                     return item;
//                 }),
//             ),
//         ]);
//     }
//     if (t.isNewExpression(expr)) {
//         if (t.isIdentifier(expr.callee) && (expr.callee.name === "Set" || expr.callee.name === "Map")) {
//             const arg = expr.arguments[0];

//             return t.callExpression(
//                 t.memberExpression(internal.id, t.identifier(expr.callee.name === "Set" ? "sm" : "mm")),
//                 expr.arguments.map(item => {
//                     return dereferenceArg(item, internal);
//                 }),
//             );
//         }
//     }

//     return dereference(expr, internal);
// }

export function trProgram(path: NodePath<types.Program>) {
    const internal: Internal = {
        id: t.identifier("Vasille"),
        stack: new StackedStates(),
        mapping: new Map<string, string>(),
        global: "",
        prefix: "Vasille_"
    };
    let injected = false;

    for (const statementPath of path.get("body")) {
        const statement = statementPath.node;

        if (t.isImportDeclaration(statement)) {
            const name = imports.get(statement.source.value);

            if (name) {
                let isPartial = false;

                internal.prefix = `${name}_`;

                for (const specifier of statement.specifiers) {
                    if (t.isImportNamespaceSpecifier(specifier)) {
                        internal.global = specifier.local.name;
                    } else if (t.isImportSpecifier(specifier)) {
                        const imported = extractText(specifier.imported);
                        const local = specifier.local.name;

                        internal.mapping.set(local, imported);
                        isPartial = true;
                    }
                }

                if (!injected && isPartial && t.isIdentifier(internal.id)) {
                    statementPath.replaceWith(
                        t.importDeclaration(
                            [...statement.specifiers, t.importSpecifier(internal.id, t.identifier("$"))],
                            statement.source,
                        ),
                    );
                    injected = true;
                }
            }
        } else {
            if (!injected) {
                if (global) {
                    internal.id = t.memberExpression(t.identifier(internal.global), t.identifier("$"));
                    injected = true;
                } else {
                    return;
                }
            }

            dereferenceStatement(statementPath, internal);
        }
    }
}
