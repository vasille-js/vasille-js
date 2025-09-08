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

// Handles import declarations and updates internal state
function handleImportDeclaration(
  statementPath: NodePath<types.ImportDeclaration>,
  internal: Internal,
  ids: Record<string, string>,
) {
  const statement = statementPath.node;
  const name = imports.get(statement.source.value);

  if (!name) return;

  // replace the web import if is required
  if (name === "VasilleWeb" && internal.replaceWeb) {
    statement.source.value = internal.replaceWeb;
  }

  internal.prefix = name;

  for (const specifier of statement.specifiers) {
    /* istanbul ignore else */
    if (t.isImportNamespaceSpecifier(specifier)) {
      internal.global = specifier.local.name;
      internal.stylesConnected = true;
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
        internal.stylesConnected = true;
      }

      internal.importStatement = statementPath;
    }
  }
  statement.specifiers = statement.specifiers.filter(spec => {
    if (!t.isImportSpecifier(spec)) return true;
    return !(
      ignoreMembers.has(extractText(spec.imported)) ||
      (!internal.devMode && extractText(spec.imported) === "Debug")
    );
  });
}

// Handles mesh and style transformation
function handleStatement(statementPath: NodePath<types.Statement>, internal: Internal) {
  if (!internal.stylesConnected || !findStyleInNode(statementPath, internal)) {
    meshStatement(statementPath, internal);
  }
}

// Handles import insertion and cleanup
function updateImports(
  path: NodePath<types.Program>,
  internal: Internal,
  ids: Record<string, string>,
  used: Set<string>,
) {
  if (used.size > 0 && !internal.importStatement && !internal.global) {
    path.get("body")[0].insertBefore(
      t.importDeclaration(
        [...used].map(name => t.importSpecifier(t.identifier(ids[name]), t.identifier(name))),
        t.stringLiteral(internal.replaceWeb ?? "vasille-web"),
      ),
    );
  }

  if (used.size > 0 && !internal.global && internal.importStatement) {
    const statementPath = internal.importStatement;
    const statement = statementPath.node;
    const specifiers = statement.specifiers.filter(item => {
      /* istanbul ignore else */
      if (t.isImportSpecifier(item) && t.isIdentifier(item.local)) {
        return statementPath.scope.bindings[item.local.name].referenced;
      }
    });

    for (const name of used) {
      if (
        !specifiers.find(
          specifier => t.isImportSpecifier(specifier) && [name, ids[name]].includes(extractText(specifier.imported)),
        )
      ) {
        specifiers.push(t.importSpecifier(t.identifier(ids[name]), t.identifier(name)));
      }
    }

    statement.specifiers = specifiers;
  }
}

export interface TransformerOptions {
  devMode: boolean;
  strictFolders: boolean;
  replaceWeb?: string;
  headTag?: boolean;
  bodyTag?: boolean;
}

// Main transformer function
export function transformProgram(path: NodePath<types.Program>, filename: string, opts: TransformerOptions) {
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
    filename,
    stylesConnected: false,
    devMode: opts.devMode,
    strictFolders: opts.strictFolders,
    replaceWeb: opts.replaceWeb,
    headTag: opts.headTag,
    bodyTag: opts.bodyTag,
    ref: arg => call("ref", arg ? [arg] : []),
    expr: (func, values) => call("expr", [getCtx(), func, values]),
    forward: arg => call("forward", [getCtx(), arg]),
    setModel: arg => call("setModel", arg ? [getCtx(), arg] : [getCtx()]),
    mapModel: arg => call("mapModel", arg ? [getCtx(), arg] : [getCtx()]),
    arrayModel: arg => call("arrayModel", arg ? [getCtx(), arg] : [getCtx()]),
    ensure: arg => call("ensure", [arg]),
    match: (name, arg) => call("match", arg ? [name, arg] : [name]),
    set: (obj, field, value) => call("set", [obj, field, value]),
    Switch: arg => call("Switch", [arg, ctx]),
  };

  function getCtx() {
    if (internal.isComposing) return ctx;
    return t.nullLiteral();
  }

  for (const statementPath of path.get("body")) {
    const statement = statementPath.node;
    if (t.isImportDeclaration(statement)) {
      handleImportDeclaration(statementPath as NodePath<types.ImportDeclaration>, internal, ids);
    } else {
      handleStatement(statementPath, internal);
    }
  }

  updateImports(path, internal, ids, used);

  if (internal.firstError) throw internal.firstError;
}
