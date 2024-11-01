import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, VariableState } from "./internal";
import { bodyHasJsx } from "./jsx-detect";
import { calls, requiresThis } from "./call";

// function propertyExtractor (expr: types.MemberExpression, internal: Internal) {
//   const props: types.Expression[] = [];
//   let o = expr;

//   while (t.isMemberExpression(o)) {
//       if (t.isPrivateName(o.property)) {
//           if (t.isMemberExpression(o.object)){
//               o = t.memberExpression(propertyExtractor(o.object, internal), o.property);
//           }
//           break;
//       }
//       else {
//           props.unshift(mesh(o.property, internal));
//       }
//   }

//   return t.callExpression(
//       t.memberExpression(internal.id, t.identifier("pe")),
//       [o, t.arrayExpression(props)]
//   );
// }

function propertyPath(expr: types.MemberExpression | types.OptionalMemberExpression) {
    const props: types.Expression[] = [];
    let o: types.Expression = expr;

    while (t.isMemberExpression(o) && t.isExpression(o.property)) {
        props.unshift(o.property);
        o = o.object;
    }

    return [o, props] as const;
}

// function readProperty (expr: types.MemberExpression | types.OptionalMemberExpression, internal: Internal) {
//   const props: types.Expression[] = [];
//   let o = expr;

//   while (t.isMemberExpression(o)) {
//       if (t.isPrivateName(o.property)) {
//           if (t.isMemberExpression(o.object)){
//               o = t.memberExpression(readProperty(o.object, internal), o.property);
//           }
//           break;
//       }
//       else {
//           props.unshift(mesh(o.property, internal));
//       }
//   }

//   return t.callExpression(
//       t.memberExpression(internal.id, t.identifier("rp")),
//       [o, t.arrayExpression(props)]
//   );
// }

export function meshOrIgnoreAllExpressions<T extends types.Node>(
    nodePaths: NodePath<types.Expression | null | T>[],
    internal: Internal,
) {
    for (const path of nodePaths) {
        if (t.isExpression(path.node)) {
            meshExpression(path as NodePath<types.Expression>, internal);
        }
    }
}

export function meshAllExpressions(nodePaths: NodePath<types.Expression | null>[], internal: Internal) {
    for (const path of nodePaths) {
        meshExpression(path, internal);
    }
}

export function meshComposeCall(
    call: types.CallExpression,
    name: types.Identifier | null,
    nodePath: NodePath<types.Node | null | undefined>,
    internal: Internal,
) {
    const arg = call.arguments[0];

    if (call.arguments.length !== 1 || !(t.isFunctionExpression(arg) || t.isArrowFunctionExpression(arg))) {
        throw nodePath.buildCodeFrameError("Vasille: Invalid arguments");
    }

    const fnPath = (nodePath as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<
        types.FunctionExpression | types.ArrowFunctionExpression
    >;

    compose(fnPath, internal);

    if (t.isArrowFunctionExpression(arg)) {
        fnPath.replaceWith(
            t.functionExpression(
                t.identifier(internal.prefix + (name ? name.name : "Default")),
                arg.params,
                t.isBlockStatement(arg.body) ? arg.body : t.blockStatement([t.returnStatement(arg.body)]),
                false,
                arg.async,
            ),
        );
    } else if (t.isFunctionExpression(arg) && name) {
        const id = arg.id ?? name;

        arg.id = t.identifier(internal.prefix + (name ? name.name : "Default"));
    }
}

export function meshAllUnknown(
    paths: NodePath<types.SpreadElement | types.ArgumentPlaceholder | types.Expression | null>[],
    internal: Internal,
) {
    for (const path of paths) {
        if (t.isSpreadElement(path.node)) {
            meshExpression((path as NodePath<types.SpreadElement>).get("argument"), internal);
        } else if (t.isExpression(path.node)) {
            meshExpression(path as NodePath<types.Expression>, internal);
        }
    }
}

export function meshLValue(path: NodePath<types.LVal | types.Expression>, internal: Internal) {
    const node = path.node;

    if (
        t.isArrayPattern(node) ||
        t.isObjectPattern(node) ||
        t.isTSParameterProperty(node) ||
        t.isAssignmentPattern(node) ||
        t.isRestElement(node)
    ) {
        return;
    }

    meshExpression(path as NodePath<typeof node>, internal);
}

export function meshOrIgnoreExpression<T extends types.Node>(
    path: NodePath<types.Expression | null | undefined | T>,
    internal: Internal,
) {
    if (t.isExpression(path.node)) {
        meshExpression(path as NodePath<types.Expression>, internal);
    }
}

export function meshExpression(nodePath: NodePath<types.Expression | null | undefined>, internal: Internal) {
    const expr = nodePath.node;

    if (!expr) {
        return;
    }
    if (calls(expr, ["compose", "extend"], internal)) {
        meshComposeCall(expr as types.CallExpression, null, nodePath, internal);

        return;
    }
    switch (expr.type) {
        case "TemplateLiteral": {
            const path = nodePath as NodePath<types.TemplateLiteral>;

            meshOrIgnoreAllExpressions<types.TSType>(path.get("expressions"), internal);
            break;
        }
        case "TaggedTemplateExpression": {
            const path = nodePath as NodePath<types.TaggedTemplateExpression>;

            meshExpression(path.get("quasi"), internal);
            break;
        }
        case "Identifier": {
            const state = internal.stack.get(expr.name);

            if (state === VariableState.Reactive) {
                nodePath.replaceWith(t.memberExpression(expr, t.identifier("$")));
            }
            break;
        }
        case "ArrayExpression": {
            const path = nodePath as NodePath<types.ArrayExpression>;

            meshAllUnknown(path.get("elements"), internal);
            break;
        }
        case "TupleExpression": {
            const path = nodePath as NodePath<types.TupleExpression>;

            meshAllUnknown(path.get("elements"), internal);
            break;
        }
        case "CallExpression": {
            const path = nodePath as NodePath<types.CallExpression>;
            const callsFn = calls(path.node, requiresThis, internal);

            if (callsFn) {
                throw path.buildCodeFrameError(`Vasille: Usage of function "${callsFn}" is restricted here`);
            }

            meshOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), internal);
            meshAllUnknown(path.get("arguments"), internal);
            break;
        }
        case "OptionalCallExpression": {
            const path = nodePath as NodePath<types.OptionalCallExpression>;

            meshExpression(path.get("callee"), internal);
            meshAllUnknown(path.get("arguments"), internal);
            break;
        }
        case "AssignmentExpression": {
            const path = nodePath as NodePath<types.AssignmentExpression>;

            meshLValue(path.get("left"), internal);
            meshExpression(path.get("right"), internal);
            break;
        }
        case "MemberExpression":
        case "OptionalMemberExpression": {
            const path = nodePath as NodePath<types.MemberExpression | types.OptionalMemberExpression>;
            const node = path.node;

            meshExpression(path.get("object"), internal);
            meshOrIgnoreExpression<types.PrivateName>(path.get("property"), internal);

            if (t.isIdentifier(node.object) && internal.stack.get(node.object.name) === VariableState.ReactiveObject) {
                path.replaceWith(t.memberExpression(node, t.identifier("$")));
            }

            break;
        }
        case "BinaryExpression": {
            const path = nodePath as NodePath<types.BinaryExpression>;

            meshOrIgnoreExpression<types.PrivateName>(path.get("left"), internal);
            meshExpression(path.get("right"), internal);
            break;
        }
        case "ConditionalExpression": {
            const path = nodePath as NodePath<types.ConditionalExpression>;

            meshExpression(path.get("test"), internal);
            meshExpression(path.get("consequent"), internal);
            meshExpression(path.get("alternate"), internal);
            break;
        }
        case "LogicalExpression": {
            const path = nodePath as NodePath<types.LogicalExpression>;

            meshExpression(path.get("left"), internal);
            meshExpression(path.get("right"), internal);
            break;
        }
        case "NewExpression": {
            const path = nodePath as NodePath<types.NewExpression>;

            meshOrIgnoreExpression<types.V8IntrinsicIdentifier>(path.get("callee"), internal);
            meshAllUnknown(path.get("arguments"), internal);
            break;
        }
        case "SequenceExpression": {
            const path = nodePath as NodePath<types.SequenceExpression>;

            meshAllExpressions(path.get("expressions"), internal);
            break;
        }
        case "ParenthesizedExpression": {
            const path = nodePath as NodePath<types.ParenthesizedExpression>;

            meshExpression(path.get("expression"), internal);
            break;
        }
        case "UnaryExpression": {
            const path = nodePath as NodePath<types.UnaryExpression>;

            meshExpression(path.get("argument"), internal);
            break;
        }
        case "UpdateExpression": {
            const path = nodePath as NodePath<types.UpdateExpression>;

            meshExpression(path.get("argument"), internal);
            break;
        }
        case "YieldExpression": {
            const path = nodePath as NodePath<types.YieldExpression>;

            meshExpression(path.get("argument"), internal);
            break;
        }
        case "AwaitExpression": {
            const path = nodePath as NodePath<types.AwaitExpression>;

            meshExpression(path.get("argument"), internal);
            break;
        }
        case "TypeCastExpression": {
            const path = nodePath as NodePath<types.TypeCastExpression>;

            meshExpression(path.get("expression"), internal);
            break;
        }
        case "BindExpression": {
            const path = nodePath as NodePath<types.BindExpression>;

            meshExpression(path.get("callee"), internal);
            meshExpression(path.get("object"), internal);
            break;
        }
        case "PipelineTopicExpression": {
            const path = nodePath as NodePath<types.PipelineTopicExpression>;

            meshExpression(path.get("expression"), internal);
            break;
        }
        case "PipelineBareFunction": {
            const path = nodePath as NodePath<types.PipelineBareFunction>;

            meshExpression(path.get("callee"), internal);
            break;
        }
        case "TSInstantiationExpression": {
            const path = nodePath as NodePath<types.TSInstantiationExpression>;

            meshExpression(path.get("expression"), internal);
            break;
        }
        case "TSAsExpression": {
            const path = nodePath as NodePath<types.TSAsExpression>;

            meshExpression(path.get("expression"), internal);
            break;
        }
        case "TSSatisfiesExpression": {
            const path = nodePath as NodePath<types.TSSatisfiesExpression>;

            meshExpression(path.get("expression"), internal);
            break;
        }
        case "TSTypeAssertion": {
            const path = nodePath as NodePath<types.TSTypeAssertion>;

            meshExpression(path.get("expression"), internal);
            break;
        }
        case "ObjectExpression": {
            const path = nodePath as NodePath<types.ObjectExpression>;

            for (const propPath of path.get("properties")) {
                const prop = propPath.node;

                if (t.isObjectProperty(prop)) {
                    const path = propPath as NodePath<types.ObjectProperty>;
                    const valuePath = path.get("value");

                    if (valuePath instanceof Array) {
                        meshAllExpressions(valuePath, internal);
                    } else {
                        meshOrIgnoreExpression<
                            types.ArrayPattern | types.AssignmentPattern | types.ObjectPattern | types.RestElement
                        >(valuePath, internal);
                    }
                } else if (t.isObjectMethod(prop)) {
                    meshFunction(propPath as NodePath<types.ObjectMethod>, internal);
                } else {
                    meshAllUnknown([propPath as NodePath<typeof prop>], internal);
                }
            }
            break;
        }
        case "FunctionExpression": {
            meshFunction(nodePath as NodePath<types.FunctionExpression>, internal);
            break;
        }
        case "ArrowFunctionExpression": {
            meshFunction(nodePath as NodePath<types.ArrowFunctionExpression>, internal);
            break;
        }
        case "JSXFragment": {
            throw nodePath.buildCodeFrameError("Vasille: JSX fragment is not allowed here");
        }
        case "JSXElement": {
            throw nodePath.buildCodeFrameError("Vasille: JSX element is not allowed here");
        }

        case "BigIntLiteral":
        case "BooleanLiteral":
        case "ClassExpression":
        case "DecimalLiteral":
        case "DoExpression":
        case "Import":
        case "ImportExpression":
        case "MetaProperty":
        case "ModuleExpression":
        case "NullLiteral":
        case "NumericLiteral":
        case "PipelinePrimaryTopicReference":
        case "RecordExpression":
        case "RegExpLiteral":
        case "StringLiteral":
        case "Super":
        case "TSNonNullExpression":
        case "ThisExpression":
        case "TopicReference":
    }
}

export function meshBody(path: NodePath<types.BlockStatement | types.Expression>, internal: Internal) {
    if (t.isExpression(path.node)) {
        meshExpression(path as NodePath<types.Expression>, internal);
    } else {
        for (const statementPath of (path as NodePath<types.BlockStatement>).get("body")) {
            meshStatement(statementPath, internal);
        }
    }
}

export function meshStatements(paths: NodePath<types.Statement>[], internal: Internal) {
    for (const path of paths) {
        meshStatement(path, internal);
    }
}

export function ignoreParams(val: types.LVal, internal: Internal) {
    if (t.isAssignmentPattern(val)) {
        val = val.left;
    }
    if (t.isIdentifier(val)) {
        internal.stack.set(val.name, VariableState.Ignored);
    } else if (t.isObjectPattern(val)) {
        for (const prop of val.properties) {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.value)) {
                internal.stack.set(prop.value.name, VariableState.Ignored);
            } else if (t.isRestElement(prop) && t.isIdentifier(prop.argument)) {
                internal.stack.set(prop.argument.name, VariableState.Ignored);
            }
        }
    } else if (t.isArrayPattern(val)) {
        for (const element of val.elements) {
            if (element) {
                ignoreParams(element, internal);
            }
        }
    }
}

export function reactiveArrayPattern(expr: types.LVal | types.OptionalMemberExpression, internal: Internal) {
    if (t.isArrayPattern(expr)) {
        for (const element of expr.elements) {
            if (t.isIdentifier(element)) {
                internal.stack.set(element.name, VariableState.Reactive);
            }
        }
    } else if (t.isIdentifier(expr)) {
        internal.stack.set(expr.name, VariableState.ReactiveObject);
    } else {
        return false;
    }

    return true;
}

export function meshStatement(path: NodePath<types.Statement | null | undefined>, internal: Internal) {
    const statement = path.node;

    if (!statement) {
        return;
    }

    switch (statement.type) {
        case "BlockStatement":
            internal.stack.push();
            meshStatements((path as NodePath<types.BlockStatement>).get("body"), internal);
            internal.stack.pop();
            break;

        case "DoWhileStatement": {
            const _path = path as NodePath<types.DoWhileStatement>;

            meshExpression(_path.get("test"), internal);
            internal.stack.push();
            meshStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "ExpressionStatement":
            meshExpression((path as NodePath<types.ExpressionStatement>).get("expression"), internal);
            break;

        case "ForInStatement": {
            const _path = path as NodePath<types.ForInStatement>;
            const left = _path.node.left;

            internal.stack.push();
            meshExpression(_path.get("right"), internal);
            if (t.isVariableDeclaration(left) && t.isVariableDeclarator(left.declarations[0])) {
                ignoreParams(left.declarations[0].id, internal);
            }
            meshStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "ForOfStatement": {
            const _path = path as NodePath<types.ForOfStatement>;
            const left = _path.node.left;

            internal.stack.push();
            meshExpression(_path.get("right"), internal);
            if (t.isVariableDeclaration(left) && t.isVariableDeclarator(left.declarations[0])) {
                ignoreParams(left.declarations[0].id, internal);
            }
            meshStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "ForStatement": {
            const _path = path as NodePath<types.ForStatement>;
            const node = _path.node;

            internal.stack.push();
            if (node.init) {
                if (t.isExpression(node.init)) {
                    meshExpression(_path.get("init") as NodePath<types.Expression>, internal);
                } else {
                    const variablePath = _path.get("init") as NodePath<types.VariableDeclaration>;

                    for (const declarationPath of variablePath.get("declarations")) {
                        meshExpression(declarationPath.get("init"), internal);
                        ignoreParams(declarationPath.node.id, internal);
                    }
                }
            }

            meshExpression(_path.get("test"), internal);
            meshExpression(_path.get("update"), internal);
            meshStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "FunctionDeclaration":
            meshFunction(path as NodePath<types.FunctionDeclaration>, internal);
            break;

        case "IfStatement": {
            const _path = path as NodePath<types.IfStatement>;

            meshExpression(_path.get("test"), internal);
            internal.stack.push();
            meshStatement(_path.get("consequent"), internal);
            internal.stack.pop();
            internal.stack.push();
            meshStatement(_path.get("alternate"), internal);
            internal.stack.pop();
            break;
        }

        case "LabeledStatement":
            meshStatement((path as NodePath<types.LabeledStatement>).get("body"), internal);
            break;

        case "ReturnStatement":
            meshExpression((path as NodePath<types.ReturnStatement>).get("argument"), internal);
            break;

        case "SwitchStatement": {
            const _path = path as NodePath<types.SwitchStatement>;

            meshExpression(_path.get("discriminant"), internal);
            internal.stack.push();
            for (const _case of _path.get("cases")) {
                meshExpression(_case.get("test"), internal);
                meshStatements(_case.get("consequent"), internal);
            }
            internal.stack.pop();
            break;
        }
        case "ThrowStatement":
            meshExpression((path as NodePath<types.ThrowStatement>).get("argument"), internal);
            break;

        case "TryStatement":
            meshStatement((path as NodePath<types.TryStatement>).get("block"), internal);
            break;

        case "VariableDeclaration": {
            const _path = path as NodePath<types.VariableDeclaration>;

            for (const declaration of _path.get("declarations")) {
                const expr = declaration.node.init;
                let ignore = true;

                if (expr && t.isIdentifier(declaration.node.id) && calls(expr, ["compose", "extend"], internal)) {
                    meshComposeCall(
                        expr as types.CallExpression,
                        declaration.node.id,
                        declaration.get("init"),
                        internal,
                    );
                } else {
                    meshExpression(declaration.get("init"), internal);
                    if (ignore) {
                        ignoreParams(declaration.node.id, internal);
                    }
                }
            }
            break;
        }
        case "WhileStatement": {
            const _path = path as NodePath<types.WhileStatement>;

            meshExpression(_path.get("test"), internal);
            internal.stack.push();
            meshStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "WithStatement": {
            const _path = path as NodePath<types.WithStatement>;

            meshExpression(_path.get("object"), internal);
            internal.stack.push();
            meshStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "ExportNamedDeclaration": {
            meshStatement((path as NodePath<types.ExportNamedDeclaration>).get("declaration"), internal);
            break;
        }

        // Ignored
        case "ExportDefaultDeclaration":
        case "ExportAllDeclaration":
        case "BreakStatement":
        case "ContinueStatement":
        case "DebuggerStatement":
        case "EmptyStatement":
        case "ClassDeclaration":
        case "ImportDeclaration":
        case "DeclareClass":
        case "DeclareFunction":
        case "DeclareInterface":
        case "DeclareModule":
        case "DeclareModuleExports":
        case "DeclareTypeAlias":
        case "DeclareOpaqueType":
        case "DeclareVariable":
        case "DeclareExportDeclaration":
        case "DeclareExportAllDeclaration":
        case "InterfaceDeclaration":
        case "OpaqueType":
        case "TypeAlias":
        case "EnumDeclaration":
        case "TSDeclareFunction":
        case "TSInterfaceDeclaration":
        case "TSTypeAliasDeclaration":
        case "TSEnumDeclaration":
        case "TSModuleDeclaration":
        case "TSImportEqualsDeclaration":
        case "TSExportAssignment":
        case "TSNamespaceExportDeclaration":
    }
}

export function meshFunction(
    path: NodePath<
        types.ArrowFunctionExpression | types.FunctionExpression | types.FunctionDeclaration | types.ObjectMethod
    >,
    internal: Internal,
) {
    if (t.isFunctionDeclaration(path.node) && path.node.id) {
        internal.stack.set(path.node.id.name, VariableState.Ignored);
    }

    internal.stack.push();

    const node = path.node;

    if (t.isFunctionExpression(node) && node.id) {
        internal.stack.set(node.id.name, VariableState.Ignored);
    }

    for (const param of node.params) {
        ignoreParams(param, internal);
    }
    if (t.isExpression(node.body)) {
        meshExpression(path.get("body") as NodePath<types.Expression>, internal);
    } else {
        const bodyPath = path.get("body") as NodePath<types.BlockStatement>;

        meshStatement(bodyPath, internal);
    }

    internal.stack.pop();
}

export function composeExpression(path: NodePath<types.Expression | null | undefined>, internal: Internal) {
    const expr = path.node;

    if (!expr) {
        return;
    }

    switch (expr.type) {
        case "AssignmentExpression": {
            const assign = expr as types.AssignmentExpression;
            if (calls(assign.right, ["awaited"], internal)) {
                reactiveArrayPattern(assign.left, internal);
            } else {
                meshExpression(path, internal);
            }
            break;
        }

        default:
            meshExpression(path, internal);
    }
}

export function composeStatements(paths: NodePath<types.Statement | null | undefined>[], internal: Internal) {
    for (const path of paths) {
        composeStatement(path, internal);
    }
}

export function composeStatement(path: NodePath<types.Statement | null | undefined>, internal: Internal) {
    const statement = path.node;

    if (!statement) {
        return;
    }

    switch (statement.type) {
        case "FunctionDeclaration": {
            const _path = path as NodePath<types.FunctionDeclaration>;
            const fn = _path.node;

            if (bodyHasJsx(fn.body)) {
                compose(_path, internal);
            } else {
                meshFunction(_path, internal);
            }
            break;
        }
        case "BlockStatement": {
            internal.stack.push();
            composeStatements((path as NodePath<types.BlockStatement>).get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "DoWhileStatement": {
            const _path = path as NodePath<types.DoWhileStatement>;

            meshExpression(_path.get("test"), internal);
            internal.stack.push();
            composeStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "ExpressionStatement": {
            composeExpression((path as NodePath<types.ExpressionStatement>).get("expression"), internal);
            break;
        }
        case "ForInStatement": {
            const _path = path as NodePath<types.ForInStatement>;
            const left = _path.node.left;

            internal.stack.push();
            meshExpression(_path.get("right"), internal);
            if (t.isVariableDeclaration(left) && t.isVariableDeclarator(left.declarations[0])) {
                ignoreParams(left.declarations[0].id, internal);
            }
            composeStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "ForStatement": {
            const _path = path as NodePath<types.ForStatement>;
            const node = _path.node;

            internal.stack.push();
            if (node.init) {
                if (t.isExpression(node.init)) {
                    meshExpression(_path.get("init") as NodePath<types.Expression>, internal);
                } else {
                    const variablePath = _path.get("init") as NodePath<types.VariableDeclaration>;

                    for (const declarationPath of variablePath.get("declarations")) {
                        meshExpression(declarationPath.get("init"), internal);
                        ignoreParams(declarationPath.node.id, internal);
                    }
                }
            }

            meshExpression(_path.get("test"), internal);
            meshExpression(_path.get("update"), internal);
            composeStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "IfStatement": {
            const _path = path as NodePath<types.IfStatement>;

            meshExpression(_path.get("test"), internal);
            internal.stack.push();
            composeStatement(_path.get("consequent"), internal);
            internal.stack.pop();
            internal.stack.push();
            composeStatement(_path.get("alternate"), internal);
            internal.stack.pop();
            break;
        }
        case "LabeledStatement":
            composeStatement((path as NodePath<types.LabeledStatement>).get("body"), internal);
            break;

        case "ReturnStatement":
            composeExpression((path as NodePath<types.ReturnStatement>).get("argument"), internal);
            break;

        case "SwitchStatement": {
            const _path = path as NodePath<types.SwitchStatement>;

            meshExpression(_path.get("discriminant"), internal);
            internal.stack.push();
            for (const _case of _path.get("cases")) {
                meshExpression(_case.get("test"), internal);
                composeStatements(_case.get("consequent"), internal);
            }
            internal.stack.pop();
            break;
        }
        case "TryStatement":
            composeStatement((path as NodePath<types.TryStatement>).get("block"), internal);
            break;

        case "VariableDeclaration": {
            const _path = path as NodePath<types.VariableDeclaration>;
            const kind = _path.node.kind;
            const declares = kind === "const" ? VariableState.Ignored : VariableState.Reactive;

            if (kind === "let" || kind === "var") {
                _path.node.kind = "const";
            }

            for (const declaration of _path.get("declarations")) {
                const id = declaration.node.id;
                let meshInit = true;

                ignoreParams(declaration.node.id, internal);

                if (calls(declaration.node.init, ["awaited"], internal)) {
                    reactiveArrayPattern(declaration.node.id, internal);
                    meshAllUnknown(
                        (declaration.get("init") as NodePath<types.CallExpression>).get("arguments"),
                        internal,
                    );
                    meshInit = false;
                } else if (t.isIdentifier(id)) {
                    internal.stack.set(id.name, declares);
                    if (declares === VariableState.Reactive) {
                        declaration
                            .get("init")
                            .replaceWith(
                                t.callExpression(
                                    t.memberExpression(t.thisExpression(), t.identifier("ref")),
                                    declaration.node.init ? [declaration.node.init] : [],
                                ),
                            );
                    }
                }
                if (meshInit) {
                    meshExpression(declaration.get("init"), internal);
                }
            }
            break;
        }
        case "WhileStatement": {
            const _path = path as NodePath<types.WhileStatement>;

            meshExpression(_path.get("test"), internal);
            internal.stack.push();
            composeStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        case "WithStatement": {
            throw path.buildCodeFrameError("Vasille: Usage of 'with' in components is restricted");
        }
        case "ForOfStatement": {
            const _path = path as NodePath<types.ForOfStatement>;
            const left = _path.node.left;

            internal.stack.push();
            meshExpression(_path.get("right"), internal);
            if (t.isVariableDeclaration(left) && t.isVariableDeclarator(left.declarations[0])) {
                ignoreParams(left.declarations[0].id, internal);
            }
            composeStatement(_path.get("body"), internal);
            internal.stack.pop();
            break;
        }
        default:
            meshStatement(path, internal);
    }
}

export function compose(
    path: NodePath<types.ArrowFunctionExpression | types.FunctionExpression | types.FunctionDeclaration>,
    internal: Internal,
) {
    if (t.isFunctionDeclaration(path.node) && path.node.id) {
        internal.stack.set(path.node.id.name, VariableState.Ignored);
    }

    internal.stack.push();

    const node = path.node;
    const params = node.params;
    const body = node.body;

    if (t.isFunctionExpression(node) && node.id) {
        internal.stack.set(node.id.name, VariableState.Ignored);
    }

    if (params.length > 1) {
        throw path.get("params")[1].buildCodeFrameError("Vasille: JSX compoent must have no more then 1 parameter");
    }

    for (const param of params) {
        const target = t.isAssignmentPattern(param) ? param.left : param;

        if (t.isIdentifier(target)) {
            internal.stack.set(target.name, VariableState.ReactiveObject);
        } else if (t.isObjectPattern(target)) {
            for (const prop of target.properties) {
                if (t.isObjectProperty(prop) && t.isIdentifier(prop.value)) {
                    internal.stack.set(prop.value.name, VariableState.Reactive);
                } else if (t.isRestElement(prop) && t.isIdentifier(prop.argument)) {
                    internal.stack.set(prop.argument.name, VariableState.ReactiveObject);
                }
            }
        } else {
            throw path
                .get("params")[0]
                .buildCodeFrameError("Vasille: Parameter must be an identifier of object pattern");
        }
    }

    if (t.isExpression(body)) {
        composeExpression(path.get("body") as NodePath<types.Expression>, internal);
    } else if (t.isBlockStatement(body)) {
        composeStatement(path.get("body") as NodePath<types.BlockStatement>, internal);
    }

    internal.stack.pop();
}
