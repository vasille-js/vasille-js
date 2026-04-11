import { NodePath, types } from "@babel/core";
import { Internal, V } from "./internal";
import { meshExpression } from "./mesh";
import * as t from "@babel/types";

const assigmentToBinaryMap = {
  "+=": "+",
  "-=": "-",
  "/=": "/",
  "%=": "%",
  "*=": "*",
  "**=": "**",
  "&=": "&",
  "|=": "|",
  ">>=": ">>",
  ">>>=": ">>>",
  "<<=": "<<",
  "^=": "^",
} as const;
const assigmentToLogicalMap = {
  "&&=": "&&",
  "||=": "||",
  "??=": "??",
} as const;

export function assignmentToBinaryOperator(
  operator: string,
): (typeof assigmentToBinaryMap)[keyof typeof assigmentToBinaryMap] | undefined {
  if (operator in assigmentToBinaryMap) {
    return assigmentToBinaryMap[operator];
  }
}

export function assignmentToLogicalOperator(
  operator: string,
): (typeof assigmentToLogicalMap)[keyof typeof assigmentToLogicalMap] | undefined {
  if (operator in assigmentToLogicalMap) {
    return assigmentToLogicalMap[operator];
  }
}

export function meshAssigment(
  path: NodePath<types.AssignmentExpression>,
  left: NodePath<types.MemberExpression>,
  right: NodePath<types.Expression>,
  property: types.PrivateName | types.Expression,
  internal: Internal,
) {
  const binary = assignmentToBinaryOperator(path.node.operator);
  const logical = assignmentToLogicalOperator(path.node.operator);

  meshExpression(left.get("object"), internal);
  meshExpression(right, internal);

  /* istanbul ignore else */
  if (!t.isPrivateName(property)) {
    let replaceWith = right.node;

    if (logical || binary) {
      const meshedLeft = t.optionalMemberExpression(left.node, V, false, true);

      if (binary) {
        replaceWith = t.binaryExpression(binary, meshedLeft, right.node);
      }
      if (logical) {
        replaceWith = t.logicalExpression(logical, meshedLeft, right.node);
      }
    }

    path.replaceWith(
      internal.set(
        left.node.object,
        !left.node.computed && t.isIdentifier(property) ? t.stringLiteral(property.name) : property,
        replaceWith,
        path.node,
      ),
    );
  }
}
