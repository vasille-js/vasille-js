import { types } from "@babel/core";
import * as t from "@babel/types";

export function stringify(node: types.Expression | types.PrivateName) {
  let name = "";

  if (t.isStringLiteral(node)) {
    name = node.value;
  }
  if (t.isPrivateName(node)) {
    name = node.id.name;
  }
  if (t.isIdentifier(node)) {
    name = node.name;
  }

  return name;
}
