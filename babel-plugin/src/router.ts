import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { ctx } from "./internal";

export function routerReplace(path: NodePath<unknown>) {
  path.replaceWith(t.memberExpression(t.memberExpression(ctx, t.identifier("runner")), t.identifier("router")));
}
