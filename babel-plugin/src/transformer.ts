import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { ctx, Internal, StackedStates } from "./internal.js";
import { meshStatement } from "./mesh.js";
import { findStyleInNode } from "./css-transformer.js";

const imports = new Map([["vasille-web", "VasilleWeb"]]);
const ignoreMembers = new Set([
  "raw",
  "theme",
  "dark",
  "mobile",
  "tablet",
  "laptop",
  "prefersDark",
  "prefersLight",
  "bridge",
  "router",
  "beforeMount",
  "afterMount",
  "beforeDestroy",
  "If",
  "ElseIf",
  "Else",
]);

function extractText(node: types.Identifier | types.StringLiteral) {
  // no case found for string literal
  return (node as types.Identifier).name;
}

export function trProgram(path: NodePath<types.Program>, devMode: boolean) {
  let stylesConnected = false;
  const used = new Set<string>();
  const ids = {
    ref: "VasilleRef",
    expr: "VasilleExpr",
    forward: "VasilleForward",
    backward: "VasilleBackward",
    setModel: "VasilleSetModel",
    mapModel: "VasilleMapModel",
    arrayModel: "VasilleArrayModel",
    ensure: "VasilleEnsure",
    match: "VasilleMatch",
    set: "VasilleSet",
    Switch: "VasilleSwitch",
  };

  function call(
    key: keyof typeof ids,
    args: (types.Expression | types.SpreadElement | types.ArgumentPlaceholder)[],
  ): types.CallExpression {
    used.add(key);

    if (internal.global) {
      return t.callExpression(t.memberExpression(t.identifier(internal.global), t.identifier(key)), args);
    }

    return t.callExpression(t.identifier(ids[key]), args);
  }

  const internal: Internal = {
    stack: new StackedStates(),
    mapping: new Map<string, string>(),
    global: "",
    prefix: "Vasille_",
    importStatement: null,
    stateOnly: false,
    devMode: devMode,
    ref(arg) {
      return call("ref", arg ? [arg] : []);
    },
    expr(func, values) {
      return call("expr", [getCtx(), func, values]);
    },
    forward(arg) {
      return call("forward", [getCtx(), arg]);
    },
    backward(arg) {
      return call("backward", [arg]);
    },
    setModel(arg) {
      return call("setModel", arg ? [getCtx(), arg] : [getCtx()]);
    },
    mapModel(arg) {
      return call("mapModel", arg ? [getCtx(), arg] : [getCtx()]);
    },
    arrayModel(arg) {
      return call("arrayModel", arg ? [getCtx(), arg] : [getCtx()]);
    },
    ensure(arg) {
      return call("ensure", [arg]);
    },
    match(name, arg) {
      return call("match", arg ? [name, arg] : [name]);
    },
    set(obj, field, value) {
      return call("set", [obj, field, value]);
    },
    Switch(arg) {
      return call("Switch", [arg, ctx]);
    },
  };

  function getCtx() {
    if (internal.isComposing) {
      return ctx;
    }

    return t.nullLiteral();
  }

  for (const statementPath of path.get("body")) {
    const statement = statementPath.node;

    if (t.isImportDeclaration(statement)) {
      const name = imports.get(statement.source.value);

      if (name) {
        internal.prefix = name;

        for (const specifier of statement.specifiers) {
          /* istanbul ignore else */
          if (t.isImportNamespaceSpecifier(specifier)) {
            internal.global = specifier.local.name;
            stylesConnected = true;
          } else if (t.isImportSpecifier(specifier)) {
            const imported = extractText(specifier.imported);
            const local = specifier.local.name;

            if (imported === "bind" || imported === "calculate" || imported === "watch") {
              ids.expr = local;
            }
            if (imported in ids) {
              ids[imported] = local;
            }

            internal.mapping.set(local, imported);
            if (imported === "styleSheet") {
              stylesConnected = true;
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
      }
    } else if (!stylesConnected || !findStyleInNode(statementPath, internal)) {
      meshStatement(statementPath, internal);
    }
  }

  if (used.size > 0 && !internal.importStatement && !internal.global) {
    path.get("body")[0].insertBefore(
      t.importDeclaration(
        [...used].map(name => {
          return t.importSpecifier(t.identifier(ids[name]), t.identifier(name));
        }),
        t.stringLiteral("vasille-web"),
      ),
    );
  }

  if (used.size > 0 && !internal.global && internal.importStatement) {
    const statementPath = internal.importStatement;
    const statement = statementPath.node;
    // This filter removes unused imports
    const specifiers = statement.specifiers.filter(item => {
      /* istanbul ignore else */
      if (t.isImportSpecifier(item) && t.isIdentifier(item.local)) {
        return statementPath.scope.bindings[item.local.name].referenced;
      }
    });

    for (const name of used) {
      // This code adds missing used imports
      if (
        !specifiers.find(specifier => {
          return t.isImportSpecifier(specifier) && [name, ids[name]].includes(extractText(specifier.imported));
        })
      ) {
        specifiers.push(t.importSpecifier(t.identifier(ids[name]), t.identifier(name)));
      }
    }

    statement.specifiers = specifiers;
  }

  if (internal.firstError) {
    throw internal.firstError;
  }
}
