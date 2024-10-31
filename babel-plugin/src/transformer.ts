import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, StackedStates, VariableState } from "./internal";
import { meshExpression, meshStatement } from "./mesh";

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

export function trProgram(path: NodePath<types.Program>, noConflict: boolean) {
    let id!: types.Expression;
    const internal: Internal = {
        get id() {
            this.internalUsed = true;

            return id;
        },
        set id(expr: types.Expression) {
            id = expr;
        },
        stack: new StackedStates(),
        mapping: new Map<string, string>(),
        global: "",
        prefix: "Vasille_",
        importStatement: null,
        internalUsed: false,
    };

    for (const statementPath of path.get("body")) {
        const statement = statementPath.node;

        if (t.isImportDeclaration(statement)) {
            const name = imports.get(statement.source.value);

            if (name) {
                internal.prefix = `${name}_`;

                for (const specifier of statement.specifiers) {
                    if (t.isImportNamespaceSpecifier(specifier)) {
                        internal.global = specifier.local.name;
                        id = t.memberExpression(t.identifier(internal.global), t.identifier("$"));
                    } else if (t.isImportSpecifier(specifier)) {
                        const imported = extractText(specifier.imported);
                        const local = specifier.local.name;

                        internal.mapping.set(local, imported);

                        if (!id) {
                            id = t.identifier(noConflict ? name : "$");
                        }
                        internal.importStatement = statementPath as NodePath<types.ImportDeclaration>;
                    }
                }
            }
        } else {
            if (!id) {
                return;
            }

            meshStatement(statementPath, internal);
        }
    }

    if (internal.internalUsed && !internal.global && internal.importStatement) {
        const statementPath = internal.importStatement;
        const statement = statementPath.node;

        statementPath.replaceWith(
            t.importDeclaration(
                [...statement.specifiers, t.importSpecifier(internal.id as types.Identifier, t.identifier("$"))],
                statement.source,
            ),
        );
    }
}
