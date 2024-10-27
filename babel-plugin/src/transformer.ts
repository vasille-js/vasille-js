import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";

const imports = new Set(["vasille-dx"]);
let internalId: types.Expression = t.identifier("Vasille_Internal_$$$");

function extractText(node: types.Identifier | types.StringLiteral) {
    return t.isIdentifier(node) ? node.name : node.value;
}

export function trProgram(path: NodePath<types.Program>) {
    let mapping = new Map<string, string>();
    let injected = false;
    let global = '';

    for (const statementPath of path.get("body")) {
        const statement = statementPath.node;

        if (t.isImportDeclaration(statement)) {
            if (imports.has(statement.source.value)) {
                let isPartial = false;

                for (const specifier of statement.specifiers) {
                    if (t.isImportNamespaceSpecifier(specifier)) {
                        global = specifier.local.name;
                    }
                    else if (t.isImportSpecifier(specifier)) {
                        const imported = extractText(specifier.imported);
                        const local = specifier.local.name;

                        mapping.set(local, imported);
                        isPartial = true;
                    }
                }

                if (!injected && isPartial && t.isIdentifier(internalId)) {
                    statementPath.replaceWith(
                        t.importDeclaration(
                            [...statement.specifiers, t.importSpecifier(internalId, t.identifier("$"))],
                            statement.source,
                        ),
                    );
                }
            }
            else {
                if (!injected) {
                    if (global) {
                        internalId = t.memberExpression(t.identifier(global), t.identifier('$'))
                        injected = true;
                    }
                    else {
                        return;
                    }
                }
            }
        }
    }
}
