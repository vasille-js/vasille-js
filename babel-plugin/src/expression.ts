import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, VariableState } from "./internal";

interface Search {
    found: Map<string, types.Expression>;
    extenal: Internal;
}

export function encodeName(name: string): types.Identifier {
    return t.identifier(`Vasille_${name}`);
}

function addIdentifier(path: NodePath<types.Identifier>, search: Search) {
    if (!search.found.has(path.node.name)) {
        search.found.set(path.node.name, path.node);
    }
    path.replaceWith(encodeName(path.node.name));
}

function stringify(node: types.Expression | types.PrivateName) {
    if (t.isIdentifier(node)) {
        return node.name;
    }
    if (t.isStringLiteral(node)) {
        return node.value;
    }
    if (t.isPrivateName(node)) {
        return node.id.name;
    }

    return "$";
}

function addMemberExpr(path: NodePath<types.MemberExpression | types.OptionalMemberExpression>, search: Search) {
    const names: string[] = [];
    let it: types.Expression = path.node;

    while (it instanceof t.memberExpression) {
        names.push(stringify(it.property));
    }

    names.push(stringify(it));

    const name = names.reverse().join("_");

    if (!search.found.has(name)) {
        search.found.set(name, path.node);
    }
    path.replaceWith(encodeName(name));
}

export function checkNode(path: NodePath<types.Node>, internal: Internal): Search {
    const search: Search = {
        extenal: internal,
        found: new Map(),
    };

    path.traverse({
        Identifier(path) {
            const state = search.extenal.stack.get(path.node.name);

            if (state === VariableState.Reactive) {
                addIdentifier(path, search);
            }
        },
        MemberExpression(path) {
            if (
                t.isIdentifier(path.node.object) &&
                search.extenal.stack.get(path.node.object.name) === VariableState.ReactiveObject
            ) {
                addMemberExpr(path, search);
            }
        },
    });

    return search;
}
