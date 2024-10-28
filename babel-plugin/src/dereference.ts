import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { Internal, VariableState } from "./internal";
import { bodyHasJsx } from "./jsx-detect";

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
//           props.unshift(dereference(o.property, internal));
//       }
//   }

//   return t.callExpression(
//       t.memberExpression(internal.id, t.identifier("pe")),
//       [o, t.arrayExpression(props)]
//   );
// }

// function writeProperty (expr: types.MemberExpression, value: types.Expression, internal: Internal) {
//   const props: types.Expression[] = [];
//   let o = expr;

//   while (t.isMemberExpression(o) && t.isExpression(o.property)) {
//           props.unshift(dereference(o.property, internal));
//   }

//   return t.callExpression(
//       t.memberExpression(internal.id, t.identifier("wp")),
//       [o, t.arrayExpression(props), value]
//   );
// }

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
//           props.unshift(dereference(o.property, internal));
//       }
//   }

//   return t.callExpression(
//       t.memberExpression(internal.id, t.identifier("rp")),
//       [o, t.arrayExpression(props)]
//   );
// }

export function dereferenceAll(nodePaths: NodePath<types.Node | null>[], internal: Internal) {
    for (const path of nodePaths) {
        dereference(path, internal);
    }
}

export function dereference(nodePath: NodePath<types.Node | null | undefined>, internal: Internal) {
    const expr = nodePath.node;

    if (!t.isExpression(expr)) {
        if (t.isSpreadElement(expr)) {
            const path = nodePath as NodePath<types.SpreadElement>;

            dereference(path.get("argument"), internal);
        }

        return;
    }
    switch (expr.type) {
        case "TemplateLiteral": {
            const path = nodePath as NodePath<types.TemplateLiteral>;

            dereferenceAll(path.get("expressions"), internal);
            break;
        }
        case "TaggedTemplateExpression": {
            const path = nodePath as NodePath<types.TaggedTemplateExpression>;

            dereference(path.get("quasi"), internal);
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

            dereferenceAll(path.get("elements"), internal);
            break;
        }
        case "TupleExpression": {
            const path = nodePath as NodePath<types.TupleExpression>;

            dereferenceAll(path.get("elements"), internal);
            break;
        }
        case "CallExpression": {
            const path = nodePath as NodePath<types.CallExpression>;

            dereference(path.get("callee"), internal);
            dereferenceAll(path.get("arguments"), internal);
            break;
        }
        case "OptionalCallExpression": {
            const path = nodePath as NodePath<types.OptionalCallExpression>;

            dereference(path.get("callee"), internal);
            dereferenceAll(path.get("arguments"), internal);
            break;
        }
        case "AssignmentExpression": {
            const path = nodePath as NodePath<types.AssignmentExpression>;

            dereference(path.get("left"), internal);
            dereference(path.get("right"), internal);
            break;
            // if (!t.isExpression(expr.left)) {
            //     return t.assignmentExpression(expr.operator, expr.left, dereference(expr.right, internal));
            // }

            // const value = expr.operator !== '=' ? t.binaryExpression(
            //     expr.operator.substring(0, expr.operator.length -1) as '+',
            //     dereference(expr.left, internal),
            //     dereference(expr.right, internal)) : expr.right;

            // if (t.isMemberExpression(expr.left)) {
            //     return writeProperty(expr.left, value, internal);
            // }

            // const name = t.identifier(t.isIdentifier(expr.left) ? `Vasille_${expr.left.name}` : 'Vasille');

            // return t.callExpression(
            //     t.memberExpression(internal.id, t.identifier('sv')),
            //     [expr.left, value, t.arrowFunctionExpression([name], t.assignmentExpression('=', expr.left, name))]
            // )
        }
        case "MemberExpression": {
            const path = nodePath as NodePath<types.MemberExpression>;

            dereference(path.get("object"), internal);
            dereference(path.get("property"), internal);
            break;
        }
        case "OptionalMemberExpression": {
            const path = nodePath as NodePath<types.OptionalMemberExpression>;

            dereference(path.get("object"), internal);
            dereference(path.get("property"), internal);
            break;
        }
        case "BinaryExpression": {
            const path = nodePath as NodePath<types.BinaryExpression>;

            dereference(path.get("left"), internal);
            dereference(path.get("right"), internal);
            break;
        }
        case "ConditionalExpression": {
            const path = nodePath as NodePath<types.ConditionalExpression>;

            dereference(path.get("test"), internal);
            dereference(path.get("consequent"), internal);
            dereference(path.get("alternate"), internal);
            break;
        }
        case "LogicalExpression": {
            const path = nodePath as NodePath<types.LogicalExpression>;

            dereference(path.get("left"), internal);
            dereference(path.get("right"), internal);
            break;
        }
        case "NewExpression": {
            const path = nodePath as NodePath<types.NewExpression>;

            dereference(path.get("callee"), internal);
            dereferenceAll(path.get("arguments"), internal);
            break;
        }
        case "SequenceExpression": {
            const path = nodePath as NodePath<types.SequenceExpression>;

            dereferenceAll(path.get("expressions"), internal);
            break;
        }
        case "ParenthesizedExpression": {
            const path = nodePath as NodePath<types.ParenthesizedExpression>;

            dereference(path.get("expression"), internal);
            break;
        }
        case "UnaryExpression": {
            const path = nodePath as NodePath<types.UnaryExpression>;

            dereference(path.get("argument"), internal);
            break;
        }
        case "UpdateExpression": {
            const path = nodePath as NodePath<types.UpdateExpression>;

            dereference(path.get("argument"), internal);
            break;
        }
        case "YieldExpression": {
            const path = nodePath as NodePath<types.YieldExpression>;

            dereference(path.get("argument"), internal);
            break;
        }
        case "AwaitExpression": {
            const path = nodePath as NodePath<types.AwaitExpression>;

            dereference(path.get("argument"), internal);
            break;
        }
        case "TypeCastExpression": {
            const path = nodePath as NodePath<types.TypeCastExpression>;

            dereference(path.get("expression"), internal);
            break;
        }
        case "BindExpression": {
            const path = nodePath as NodePath<types.BindExpression>;

            dereference(path.get("callee"), internal);
            dereference(path.get("object"), internal);
            break;
        }
        case "PipelineTopicExpression": {
            const path = nodePath as NodePath<types.PipelineTopicExpression>;

            dereference(path.get("expression"), internal);
            break;
        }
        case "PipelineBareFunction": {
            const path = nodePath as NodePath<types.PipelineBareFunction>;

            dereference(path.get("callee"), internal);
            break;
        }
        case "TSInstantiationExpression": {
            const path = nodePath as NodePath<types.TSInstantiationExpression>;

            dereference(path.get("expression"), internal);
            break;
        }
        case "TSAsExpression": {
            const path = nodePath as NodePath<types.TSAsExpression>;

            dereference(path.get("expression"), internal);
            break;
        }
        case "TSSatisfiesExpression": {
            const path = nodePath as NodePath<types.TSSatisfiesExpression>;

            dereference(path.get("expression"), internal);
            break;
        }
        case "TSTypeAssertion": {
            const path = nodePath as NodePath<types.TSTypeAssertion>;

            dereference(path.get("expression"), internal);
            break;
        }
        case "ObjectExpression": {
            const path = nodePath as NodePath<types.ObjectExpression>;

            for (const propPath of path.get("properties")) {
                const prop = propPath.node;

                if (t.isObjectProperty(prop)) {
                    const path = nodePath as NodePath<types.ObjectProperty>;
                    const valuePath = propPath.get("value");

                    if (valuePath instanceof Array) {
                        dereferenceAll(valuePath, internal);
                    } else {
                        dereference(valuePath, internal);
                    }
                } else if (t.isObjectMethod(prop)) {
                    prop.body; // TODO
                } else {
                    dereference(propPath, internal);
                }
            }
            break;
        }
        case "FunctionExpression": {
            if (!bodyHasJsx(expr.body)) {
                // TODO
            }
            // TODO
            break;
        }
        case "ArrowFunctionExpression": {
            // TODO
            break;
        }
        case "JSXFragment": {
            // TODO
            break;
        }
        case "JSXElement": {
            // TODO
            break;
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
