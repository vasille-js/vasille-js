import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { ctx, inspector, Internal, runner, StackedStates } from "./internal.js";
import { meshStatement } from "./mesh.js";
import { findStyleInNode } from "./css-transformer.js";
import * as fs from "node:fs";
import path from "path";

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
const filePathId = t.identifier("VasilleFilePath");

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
    return !ignoreMembers.has(extractText(spec.imported));
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
    const specifiers = statement.specifiers;
    const usedSpecifiers = statement.specifiers.filter(item => {
      /* istanbul ignore else */
      if (t.isImportSpecifier(item) && t.isIdentifier(item.local)) {
        return statementPath.scope.bindings[item.local.name].referenced;
      }
    });

    for (const name of used) {
      if (
        !usedSpecifiers.find(
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
  devLayer: boolean;
  strictFolders: boolean;
  replaceWeb?: string;
  headTag?: boolean;
  bodyTag?: boolean;
}

export function nodeToStaticPosition(node: types.Node) {
  const array: types.Expression[] = [filePathId];

  /* istanbul ignore else */
  if (node.loc) {
    array.push(
      t.numericLiteral(node.loc.start.line),
      t.numericLiteral(node.loc.start.column),
      t.numericLiteral(node.loc.end.line),
      t.numericLiteral(node.loc.end.column),
    );
  }

  return t.arrayExpression(array);
}

const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json"), { encoding: "utf-8" }));

// Main transformer function
export function transformProgram(path: NodePath<types.Program>, filename: string, opts: TransformerOptions) {
  const used = new Set<string>();
  const ids = {
    ref: "VasilleRef",
    expr: "VasilleExpr",
    setModel: "VasilleSetModel",
    mapModel: "VasilleMapModel",
    arrayModel: "VasilleArrayModel",
    ensure: "VasilleEnsure",
    match: "VasilleMatch",
    set: "VasilleSet",
    Switch: "VasilleSwitch",
    safe: "VasilleSafe",
    executionPosition: "VasilleExePos",
    registerDevValue: "VasilleDevValue",
    shareStateById: "VasilleState",
    positionedText: "VasillePosText",
    earlyInspector: "VasilleInspector",
    registerReference: "VasilleRefence",
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
    filename: filename,
    steelFilePath: packageJson.name + filename.substring(process.cwd().length),
    stylesConnected: false,
    devLayer: opts.devLayer,
    strictFolders: opts.strictFolders,
    replaceWeb: opts.replaceWeb,
    headTag: opts.headTag,
    bodyTag: opts.bodyTag,
    ref(arg, area, name) {
      if (opts.devLayer) {
        return named(
          call("ref", [arg ? arg : t.buildUndefinedNode(), nodeToStaticPosition(area), getInspector()]),
          name,
        );
      }

      return call("ref", arg ? [arg] : []);
    },
    expr(func, values, codes, area, name) {
      if (opts.devLayer) {
        return named(
          call("expr", [
            getCtx(),
            func,
            t.arrayExpression(values),
            t.arrayExpression(codes.map(item => t.stringLiteral(item))),
            nodeToStaticPosition(area),
            getInspector(),
          ]),
          name,
        );
      }

      return call("expr", [getCtx(), func, t.arrayExpression(values)]);
    },
    setModel(arg, name) {
      if (opts.devLayer) {
        return named(call("setModel", [getInspector(), getCtx(), arg ?? t.buildUndefinedNode()]), name);
      }

      return call("setModel", arg ? [getCtx(), arg] : [getCtx()]);
    },
    mapModel(arg, name) {
      if (opts.devLayer) {
        return named(call("mapModel", [getInspector(), getCtx(), arg ?? t.buildUndefinedNode()]), name);
      }

      return call("mapModel", arg ? [getCtx(), arg] : [getCtx()]);
    },
    arrayModel(arg, name) {
      if (opts.devLayer) {
        return named(call("arrayModel", [getInspector(), getCtx(), arg ?? t.buildUndefinedNode()]), name);
      }

      return call("arrayModel", arg ? [getCtx(), arg] : [getCtx()]);
    },
    ensure(arg, area) {
      if (opts.devLayer) {
        return call("ensure", [arg, nodeToStaticPosition(area), getInspector()]);
      }

      return call("ensure", [arg]);
    },
    match(name, arg, area) {
      if (opts.devLayer) {
        return call("match", [name, arg ?? t.buildUndefinedNode(), nodeToStaticPosition(area), getInspector()]);
      }

      return call("match", arg ? [name, arg] : [name]);
    },
    set(obj, field, value, area) {
      if (opts.devLayer) {
        return call("set", [obj, field, value, nodeToStaticPosition(area), getInspector(), getExecutionPosition(area)]);
      }

      return call("set", [obj, field, value]);
    },
    Switch(arg) {
      return call("Switch", [arg, ctx]);
    },
    safe: (arg: types.FunctionExpression | types.ArrowFunctionExpression) => call("safe", [arg]),
    updateIValue(node: types.AssignmentExpression): types.Expression {
      const { left, right } = node;

      if (t.isExpression(left)) {
        return t.callExpression(t.memberExpression(left, t.identifier("update")), [right, getExecutionPosition(node)]);
      }

      return node;
    },
    registerDevValue(value: types.Expression): types.Expression {
      return call("registerDevValue", [value, nodeToStaticPosition(value), getInspector()]);
    },
    shareStateById(value: types.Expression, name: string): types.Expression {
      return shareStateById(value, name);
    },
    positionedText(text: types.Expression, area: types.Node): types.Expression {
      return call("positionedText", [text, nodeToStaticPosition(area)]);
    },
    earlyInspector(): types.Expression {
      used.add("earlyInspector");
      return t.identifier(ids["earlyInspector"]);
    },
  };

  function getCtx() {
    if (internal.isComposing) return ctx;
    return t.nullLiteral();
  }

  function getInspector() {
    if (internal.isComposing) {
      return inspector;
    }

    used.add("earlyInspector");
    return t.identifier(ids["earlyInspector"]);
  }

  function getExecutionPosition(area: types.Node) {
    return call("executionPosition", [
      runner,
      nodeToStaticPosition(area),
      t.newExpression(t.identifier("Error"), [t.stringLiteral("execution-position")]),
    ]);
  }

  function named(node: t.CallExpression, name: string | undefined) {
    if (name && internal.isComposing) {
      return shareStateById(node, name);
    }

    return node;
  }

  function shareStateById(node: types.Expression, name: string) {
    return call("shareStateById", [t.memberExpression(ctx, t.identifier("id")), runner, t.stringLiteral(name), node]);
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

  if (opts.devLayer) {
    path.node.body.unshift(
      t.variableDeclaration("const", [t.variableDeclarator(filePathId, t.stringLiteral(internal.steelFilePath))]),
    );
  }
}

export function inspectorOf(internal: Internal) {
  if (internal.isComposing) {
    return inspector;
  }

  return internal.earlyInspector();
}
