import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, StackedStates, VariableState } from "./internal";
import { dereference, dereferenceArg } from "./dereference";

const imports = new Set(["vasille-dx"]);

function extractText(node: types.Identifier | types.StringLiteral) {
    return t.isIdentifier(node) ? node.name : node.value;
}

function possibleModel(expr: types.Expression, internal: Internal) {
    if (t.isArrayExpression(expr)) {
        return t.callExpression(t.memberExpression(internal.id, t.identifier("am")), [
            t.arrayExpression(
                expr.elements.map(item => {
                    if (t.isExpression(item)) {
                        return dereference(item, internal);
                    }

                    if (t.isSpreadElement(item)) {
                        return t.spreadElement(dereference(item.argument, internal));
                    }

                    return item;
                }),
            ),
        ]);
    }
    if (t.isNewExpression(expr)) {
        if (t.isIdentifier(expr.callee) && (expr.callee.name === "Set" || expr.callee.name === "Map")) {
            const arg = expr.arguments[0];

            return t.callExpression(
                t.memberExpression(internal.id, t.identifier(expr.callee.name === "Set" ? "sm" : "mm")),
                expr.arguments.map(item => {
                    return dereferenceArg(item, internal);
                }),
            );
        }
    }

    return dereference(expr, internal);
}

export function trProgram(path: NodePath<types.Program>) {
    const internal: Internal = {
        id: t.identifier("Vasille_Internal_$$$"),
        stack: new StackedStates(),
        mapping: new Map<string, string>(),
    };
    let injected = false;
    let global = "";

    for (const statementPath of path.get("body")) {
        const statement = statementPath.node;

        if (t.isImportDeclaration(statement)) {
            if (imports.has(statement.source.value)) {
                let isPartial = false;

                for (const specifier of statement.specifiers) {
                    if (t.isImportNamespaceSpecifier(specifier)) {
                        global = specifier.local.name;
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
                    internal.id = t.memberExpression(t.identifier(global), t.identifier("$"));
                    injected = true;
                } else {
                    return;
                }
            }

            if (t.isVariableDeclaration(statement)) {
                if (statement.kind !== "const") {
                    statementPath.replaceWith(
                        t.variableDeclaration(
                            "const",
                            statement.declarations.map(declarator => {
                                if (t.isIdentifier(declarator.id)) {
                                    internal.stack.set(declarator.id.name, VariableState.Reactive);

                                    return t.variableDeclarator(
                                        declarator.id,
                                        t.callExpression(
                                            t.memberExpression(internal.id, t.identifier("var")),
                                            declarator.init ? [declarator.init] : [],
                                        ),
                                    );
                                }

                                return t.variableDeclarator(
                                    declarator.id,
                                    t.callExpression(
                                        t.memberExpression(internal.id, t.identifier("var")),
                                        declarator.init
                                            ? [t.callExpression(t.memberExpression(internal.id, t.identifier("rv")))]
                                            : [],
                                    ),
                                );
                            }),
                        ),
                    );
                } else {
                    statement.declarations.map(declarator => {
                        if (t.isIdentifier(declarator.id)) {
                            internal.stack.set(declarator.id.name, VariableState.Ignored);
                        }
                    });
                }
            }
        }
    }
}
