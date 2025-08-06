import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { checkExpression, checkNode, encodeName, idIsIValue, memberIsIValue, Search } from "./expression";
import { Internal } from "./internal";
import { processCalculateCall } from "./lib";
import { meshExpression } from "./mesh";
import { stringify } from "./utils";

const bridgeConstName = "bridge";

export function processBridgeCall(
  path: NodePath<types.Expression | null | undefined>,
  internal: Internal,
  search?: Search,
) {
  const node = path.node;

  if (t.isCallExpression(node) && t.isMemberExpression(node.callee)) {
    const callee = node.callee;
    let propName: string | null = null;

    if (t.isIdentifier(callee.object)) {
      const mapped = internal.mapping.get(callee.object.name);

      if (mapped && mapped === bridgeConstName && internal.stack.get(callee.object.name) === undefined) {
        propName = stringify(callee.property);
      }
    }

    if (t.isMemberExpression(callee.object) && t.isIdentifier(callee.object.object)) {
      const rootName = callee.object.object.name;

      if (
        rootName === internal.global &&
        internal.stack.get(rootName) === undefined &&
        stringify(callee.object.property) === bridgeConstName
      ) {
        propName = stringify(callee.property);
      }
    }

    if (propName) {
      const getArg = (mesh = true) => {
        if (node.arguments.length !== 1 || !t.isExpression(node.arguments[0])) {
          throw path.buildCodeFrameError("Vasille: Expected 1 argument");
        }
        if (mesh) {
          meshExpression(path.get("arguments")[0] as NodePath<types.Expression>, internal);
        }

        return node.arguments[0];
      };
      const callWithArg = (name: string) => {
        path.replaceWith(t.callExpression(t.memberExpression(internal.id, t.identifier(name)), [getArg()]));
      };
      const callWithOptionalArg = (name: string) => {
        if (node.arguments.length === 0) {
          path.replaceWith(t.callExpression(t.memberExpression(internal.id, t.identifier(name)), []));
        } else {
          callWithArg(name);
        }
      };

      switch (propName) {
        case "ref": {
          callWithArg("r");
          break;
        }
        case "bind": {
          const arg = getArg(false);
          const result = checkNode(path.get("arguments")[0], internal);

          if (result.self) {
            path.replaceWith(result.self);
          } else if (result.found.size > 0) {
            const found = result.found;

            path.replaceWith(
              t.callExpression(t.memberExpression(internal.id, t.identifier("ex")), [
                t.arrowFunctionExpression([...found.keys()].map(encodeName), arg),
                t.arrayExpression([...found.values()]),
              ]),
            );
          } else {
            callWithArg("r");
          }
          break;
        }
        case "calculate":
        case "watch": {
          const args = processCalculateCall(path as NodePath<types.CallExpression>, internal);

          path.replaceWith(t.callExpression(t.memberExpression(internal.id, t.identifier("ex")), args));
          break;
        }
        case "arrayModel": {
          callWithOptionalArg("sam");
          break;
        }
        case "setModel": {
          callWithOptionalArg("ssm");
          break;
        }
        case "mapModel": {
          callWithOptionalArg("smm");
          break;
        }
        case "reactiveObject": {
          callWithArg("sro");
          break;
        }
        case "value": {
          if (!search) {
            path.replaceWith(t.memberExpression(getArg(), t.identifier("$")));
          } else {
            path.replaceWith(getArg());
          }
          break;
        }
        case "setValue": {
          if (node.arguments.length !== 2 || !t.isExpression(node.arguments[0]) || !t.isExpression(node.arguments[1])) {
            throw path.buildCodeFrameError("Vasille: Expected 2 arguments");
          }

          meshExpression(path.get("arguments")[0] as NodePath<types.Expression>, internal);

          if (search) {
            checkExpression(path.get("arguments")[1] as NodePath<types.Expression>, search);
          } else {
            meshExpression(path.get("arguments")[1] as NodePath<types.Expression>, internal);
          }

          path.replaceWith(
            t.assignmentExpression("=", t.memberExpression(node.arguments[0], t.identifier("$")), node.arguments[1]),
          );
          break;
        }
        case "stored": {
          const arg = getArg(false);

          if (
            (t.isIdentifier(arg) && idIsIValue(path.get("arguments")[0] as NodePath<types.Identifier>, internal)) ||
            (t.isMemberExpression(arg) && memberIsIValue(arg, internal))
          ) {
            path.replaceWith(t.memberExpression(arg, t.identifier("$")));
          } else {
            callWithArg("rv");
          }

          break;
        }
        case "destroy": {
          path.replaceWith(t.callExpression(t.memberExpression(getArg(true), t.identifier("destroy")), []));
          break;
        }
        default:
          throw path.buildCodeFrameError(`Vasille: Unknown bridge method "${propName}"`);
      }

      return propName;
    }
  }

  return false;
}
