import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, StackedStates } from "./internal";
import { meshStatement } from "./mesh";
import { findStyleInNode } from "./css-transformer";

const imports = new Map([
  ["vasille-dx", "VasilleDX"],
  ["vasille-web", "VasilleWeb"],
]);
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
  "theme",
  "dark",
  "mobile",
  "tablet",
  "laptop",
  "prefersDark",
  "prefersLight",
  "state",
]);

function extractText(node: types.Identifier | types.StringLiteral) {
  // no case found for string literal
  return (node as types.Identifier).name;
}

export function trProgram(path: NodePath<types.Program>, devMode: boolean) {
  let id!: types.Expression;
  let stylesConnected = false;
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
    cssGlobal: "",
    prefix: "Vasille_",
    importStatement: null,
    internalUsed: false,
    stateOnly: false,
    devMode: devMode,
  };

  for (const statementPath of path.get("body")) {
    const statement = statementPath.node;

    if (t.isImportDeclaration(statement)) {
      const name = imports.get(statement.source.value);

      if (name) {
        internal.prefix = name;

        for (const specifier of statement.specifiers) {
          if (t.isImportNamespaceSpecifier(specifier)) {
            internal.global = specifier.local.name;
            if (statement.source.value === "vasille-web") {
              internal.cssGlobal = internal.global;
              stylesConnected = true;
            }
            internal.id = t.memberExpression(t.identifier(internal.global), t.identifier("$"));
          } else if (t.isImportSpecifier(specifier)) {
            const imported = extractText(specifier.imported);
            const local = specifier.local.name;

            internal.mapping.set(local, imported);
            if (imported === "webStyleSheet") {
              stylesConnected = true;
            }

            if (!id) {
              internal.id = t.identifier(name);
            }
            internal.importStatement = statementPath as NodePath<types.ImportDeclaration>;
          }
        }
        statement.specifiers = statement.specifiers.filter(spec => {
          if (!t.isImportSpecifier(spec)) {
            return true;
          } else {
            return !(
              ignoreMembers.has(extractText(spec.imported)) ||
              (!internal.devMode && extractText(spec.imported) === "Debug")
            );
          }
        });
      } else if (statement.source.value === "vasille-css") {
        for (const specifier of statement.specifiers) {
          if (t.isImportSpecifier(specifier)) {
            internal.mapping.set(specifier.local.name, extractText(specifier.imported));
          } else if (t.isImportNamespaceSpecifier(specifier)) {
            internal.cssGlobal = specifier.local.name;
          }
        }
        statement.specifiers = statement.specifiers.filter(spec => {
          if (!t.isImportSpecifier(spec)) {
            return true;
          } else {
            return !ignoreMembers.has(extractText(spec.imported));
          }
        });
        stylesConnected = true;
      }
    } else {
      if (!id) {
        if (stylesConnected) {
          findStyleInNode(statementPath, internal);
        } else {
          return;
        }
      } else if (!stylesConnected || !findStyleInNode(statementPath, internal)) {
        meshStatement(statementPath, internal);
      }
    }
  }

  if (internal.internalUsed && !internal.global && internal.importStatement) {
    const statementPath = internal.importStatement;
    const statement = statementPath.node;

    statementPath.replaceWith(
      t.importDeclaration(
        [
          ...statement.specifiers.filter(item => {
            if (t.isImportSpecifier(item) && t.isIdentifier(item.local)) {
              return statementPath.scope.bindings[item.local.name].referenced;
            }
          }),
          t.importSpecifier(internal.id as types.Identifier, t.identifier("$")),
        ],
        statement.source,
      ),
    );
  }
}
