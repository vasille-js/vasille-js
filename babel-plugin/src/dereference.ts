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
            const path = nodePath as NodePath<types.SpreadElement>

            dereference(path.get('argument'), internal);
        }

        return;
    }

    if (t.isTemplateLiteral(expr)) {
        const path = nodePath as NodePath<types.TemplateLiteral>;

        dereferenceAll(path.get('expressions'), internal);
    }
    if (t.isTaggedTemplateExpression(expr)) {
        const path = nodePath as NodePath<types.TaggedTemplateExpression>;

        dereference(path.get('quasi'), internal);
    }
    if (t.isIdentifier(expr)) {
        const state = internal.stack.get(expr.name);

        if (state === VariableState.Reactive) {
            nodePath.replaceWith(t.memberExpression(expr, t.identifier('$')));
        }
    }
    if (t.isArrayExpression(expr)) {
        const path = nodePath as NodePath<types.ArrayExpression>

        dereferenceAll(path.get('elements'), internal);
    }
    if (t.isTupleExpression(expr)) {
        const path = nodePath as NodePath<types.TupleExpression>

        dereferenceAll(path.get('elements'), internal);
    }
    if (t.isCallExpression(expr)) {
        const path = nodePath as NodePath<types.CallExpression>

        dereference(path.get('callee'), internal);
        dereferenceAll(path.get('arguments'), internal);
    }
    if (t.isOptionalCallExpression(expr)) {
        const path = nodePath as NodePath<types.OptionalCallExpression>

        dereference(path.get('callee'), internal);
        dereferenceAll(path.get('arguments'), internal);
    }
    if (t.isAssignmentExpression(expr)) {
        const path = nodePath as NodePath<types.AssignmentExpression>

        dereference(path.get('left'), internal);
        dereference(path.get('right'), internal);
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
    if (t.isMemberExpression(expr)) {
        const path = nodePath as NodePath<types.MemberExpression>

        dereference(path.get('object'), internal)
        dereference(path.get('property'), internal)
    }
    if (t.isOptionalMemberExpression(expr)) {
        const path = nodePath as NodePath<types.OptionalMemberExpression>

        dereference(path.get('object'), internal)
        dereference(path.get('property'), internal)
    }
    if (t.isBinaryExpression(expr)) {
        const path = nodePath as NodePath<types.BinaryExpression>
        
        dereference(path.get('left'), internal);
        dereference(path.get('right'), internal);
    }
    if (t.isConditionalExpression(expr)) {
        const path = nodePath as NodePath<types.ConditionalExpression>

        dereference(path.get('test'), internal);
        dereference(path.get('consequent'), internal)
        dereference(path.get('alternate'), internal)
    }
    if (t.isLogicalExpression(expr)) {
        const path = nodePath as NodePath<types.LogicalExpression>

        dereference(path.get('left'), internal)
        dereference(path.get('right'), internal)
    }
    if (t.isNewExpression(expr)) {
        const path = nodePath as NodePath<types.NewExpression>

        dereference(path.get('callee'), internal);
        dereferenceAll(path.get('arguments'), internal);
    }
    if (t.isSequenceExpression(expr)) {
        const path = nodePath as NodePath<types.SequenceExpression>

        dereferenceAll(path.get('expressions'), internal);
    }
    if (t.isParenthesizedExpression(expr)) {
        const path = nodePath as NodePath<types.ParenthesizedExpression>

        dereference(path.get('expression'), internal)
    }
    if (t.isUnaryExpression(expr)) {
        const path = nodePath as NodePath<types.UnaryExpression>

        dereference(path.get('argument'), internal);
    }
    if (t.isUpdateExpression(expr)) {
        const path = nodePath as NodePath<types.UpdateExpression>

        dereference(path.get('argument'), internal)
    }
    if (t.isYieldExpression(expr)) {
        const path = nodePath as NodePath<types.YieldExpression>

        dereference(path.get('argument'), internal);
    }
    if (t.isAwaitExpression(expr)) {
        const path = nodePath as NodePath<types.AwaitExpression>

        dereference(path.get('argument'), internal);
    }
    if (t.isFunctionExpression(expr)) {
        if (!bodyHasJsx(expr.body)) {
            // TODO
        }
        // TODO
    }
    if (t.isArrowFunctionExpression(expr)) {
        // TODO
    }
    if (t.isJSXFragment(expr)) {
        // TODO
    }
    if (t.isJSXElement(expr)) {
        // TODO
    }
}

