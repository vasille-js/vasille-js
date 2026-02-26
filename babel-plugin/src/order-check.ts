import { NodePath, types } from "@babel/core";
import { calls, FnNames } from "./call";
import { Internal } from "./internal";
import { err, Errors } from "./lib";

interface OrderItem {
  nodeType?: types.Node["type"][];
  calls?: FnNames[];
}

const componentOrder = [
  { nodeType: ["VariableDeclaration"] },
  { calls: ["watch"] },
  { calls: ["share"] },
  { nodeType: ["FunctionDeclaration"] },
  { calls: ["beforeMount"] },
  { nodeType: ["JSXElement", "JSXFragment"] },
  { calls: ["afterMount"] },
  { calls: ["beforeDestroy"] },
  { nodeType: ["ReturnStatement"] },
] as const satisfies OrderItem[];

function matchStatement(path: NodePath<types.Statement | null | undefined>, target: OrderItem, internal: Internal) {
  const testPath = path.isExpressionStatement() ? path.get("expression") : path;

  if (target.nodeType && testPath.node) {
    return target.nodeType.includes(testPath.node.type);
  }

  if (target.calls && testPath.isExpression()) {
    return calls(testPath, target.calls, internal);
  }

  return false;
}

export function checkOrder(paths: NodePath<types.Statement | null | undefined>[], internal: Internal) {
  let index = 0;

  for (const path of paths) {
    while (index < componentOrder.length && !matchStatement(path, componentOrder[index], internal)) {
      index++;
    }

    if (index === componentOrder.length) {
      err(
        Errors.RulesOfVasille,
        path,
        [
          "Malformed component detected, required component structure is:",
          "1. Variable declarations.",
          "2. Watchers/effects (calls of `watch` function).",
          "3. Dependency sharing (calls of `share` function).",
          "4. Function declarations.",
          "5. Before mount hint (call of `beforeMount` function)",
          "6. JSX elements and fragments",
          "7. After mount hint (call of `afterMount` function)",
          "8. Before destroy hint (call of `beforeDestroy` function)",
          "9. Return statement",
          "All steps are optional, but the order is strict.",
          "Unlisted statements are not accepted.",
        ].join("\n"),
        internal,
      );
    }
  }
}
