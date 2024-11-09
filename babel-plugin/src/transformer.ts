import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, StackedStates, VariableState } from "./internal";
import { meshExpression, meshStatement } from "./mesh";

const imports = new Map([["vasille-dx", "VasilleDX"]]);
const ignoreMembers = new Set([
  "value",
  "ref",
  "bind",
  "calculate",
  "watch",
  "arrayModel",
  "mapModel",
  "reactiveObject",
  "setModel",
]);

function extractText(node: types.Identifier | types.StringLiteral) {
  return t.isIdentifier(node) ? node.name : node.value;
}

export function trProgram(path: NodePath<types.Program>, devMode: boolean) {
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
    devMode: devMode,
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
              id = t.identifier(name);
            }
            internal.importStatement = statementPath as NodePath<types.ImportDeclaration>;
          }
        }
        statement.specifiers = statement.specifiers.filter(spec => {
          if (!t.isImportSpecifier(spec)) {
            return true;
          } else {
            return !ignoreMembers.has(extractText(spec.imported));
          }
        });
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
