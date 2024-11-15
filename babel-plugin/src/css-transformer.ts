import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";
import { FnNames, calls } from "./call";
import { Internal } from "./internal";

function tryProcessProp(
  path: NodePath<types.ObjectProperty | types.ObjectMethod | types.SpreadElement>,
  pseudo: string,
  media: string,
  internal: Internal,
): Rule[] {
  if (t.isObjectMethod(path.node)) {
    throw path.buildCodeFrameError("Object methods not supported here");
  }
  if (t.isSpreadElement(path.node)) {
    throw path.buildCodeFrameError("Spread element not suppored here");
  }

  return processProp(path as NodePath<types.ObjectProperty>, pseudo, media, internal);
}

type Rule = {
  defaultMediaRule: number;
  mediaRule: string;
  theme: string;
  pseudo: string;
  rule: string;
};

const mediaDefaults: FnNames[] = ["mobile", "tablet", "laptop", "prefersDark", "prefersLight"];

function processValue(
  name: string,
  path: NodePath<types.Expression>,
  pseudo: string,
  theme: string,
  media: string,
  mediaDefault: number[],
  allowFallback: boolean,
  internal: Internal,
) {
  if (calls(path.node, ["theme"], internal)) {
    const call = path.node as types.CallExpression;

    if (theme) {
      throw path.buildCodeFrameError("Vasille: Theme seem the be defined twince");
    }
    if (t.isStringLiteral(call.arguments[0])) {
      return processValue(
        name,
        (path as NodePath<types.CallExpression>).get("arguments")[1] as NodePath<types.Expression>,
        pseudo,
        `body.${call.arguments[0].value}`,
        media,
        mediaDefault,
        false,
        internal,
      );
    } else {
      throw (path as NodePath<types.CallExpression>)
        .get("arguments")[0]
        .buildCodeFrameError("Vasille: Expected string literal");
    }
  }
  if (calls(path.node, ["dark"], internal)) {
    if (theme) {
      throw path.buildCodeFrameError("Vasille: Theme seem the be defined twince");
    }

    return processValue(
      name,
      (path as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<types.Expression>,
      pseudo,
      `.dark`,
      media,
      mediaDefault,
      false,
      internal,
    );
  }

  let callee: string | boolean | undefined;

  if ((callee = calls(path.node, mediaDefaults, internal))) {
    const index = mediaDefaults.indexOf(callee as FnNames) + 1;

    if (mediaDefault.includes(index)) {
      return processValue(
        name,
        (path as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<types.Expression>,
        pseudo,
        theme,
        media,
        mediaDefault,
        false,
        internal,
      );
    }

    return processValue(
      name,
      (path as NodePath<types.CallExpression>).get("arguments")[0] as NodePath<types.Expression>,
      pseudo,
      theme,
      media,
      [...mediaDefault, index],
      false,
      internal,
    );
  }

  function composeRules(value: string): Rule[] {
    return mediaDefault.length
      ? mediaDefault.map(index => {
          return {
            defaultMediaRule: index,
            mediaRule: media,
            pseudo: pseudo,
            theme: theme,
            rule: `${name}:${value}`,
          } satisfies Rule;
        })
      : [
          {
            defaultMediaRule: 0,
            mediaRule: media,
            pseudo: pseudo,
            theme: theme,
            rule: `${name}:${value}`,
          } satisfies Rule,
        ];
  }

  if (t.isStringLiteral(path.node)) {
    return composeRules(path.node.value);
  }
  if (t.isNumericLiteral(path.node)) {
    return composeRules(`${path.node.value}px`);
  }
  if (t.isArrayExpression(path.node)) {
    if (path.node.elements.every(item => t.isNumericLiteral(item))) {
      return composeRules(path.node.elements.map(item => `${(item as types.NumericLiteral).value}px`).join(" "));
    } else if (allowFallback) {
      return [
        ...(path as NodePath<types.ArrayExpression>)
          .get("elements")
          .map(path => {
            if (t.isExpression(path.node)) {
              return processValue(
                name,
                path as NodePath<types.Expression>,
                pseudo,
                theme,
                media,
                mediaDefault,
                false,
                internal,
              );
            } else {
              throw path.buildCodeFrameError("Vasille: Exprected expression");
            }
          })
          .flat(1),
      ];
    } else {
      throw path.buildCodeFrameError("Vasille: Only numbers arrays are suppored here");
    }
  }

  throw path.buildCodeFrameError("Vasille: Failed o parse value, it is not a string, number or array");
}

function processProp(path: NodePath<types.ObjectProperty>, pseudo: string, media: string, internal: Internal): Rule[] {
  let name: string;

  if (t.isIdentifier(path.node.key)) {
    name = path.node.key.name;
  } else if (t.isStringLiteral(path.node.key)) {
    name = path.node.key.value;
  } else {
    throw path.get("key").buildCodeFrameError("Vasille: Incompaible key, exprect idenifier or string literal");
  }

  if (name.startsWith("@")) {
    if (media || pseudo) {
      throw path.get("key").buildCodeFrameError("Vasille: Media queries allowed inly in the root of style");
    }
    if (t.isObjectExpression(path.node.value)) {
      return (path.get("value") as NodePath<types.ObjectExpression>)
        .get("properties")
        .map(item => {
          return tryProcessProp(item, "", name, internal);
        })
        .flat(1);
    } else {
      throw path.get("value").buildCodeFrameError("Vasille: Exprected object expression");
    }
  }
  if (name.startsWith(":")) {
    if (pseudo) {
      throw path.get("key").buildCodeFrameError("Recursive pseudo classes are restriced");
    }
    if (t.isObjectExpression(path.node.value)) {
      return (path.get("value") as NodePath<types.ObjectExpression>)
        .get("properties")
        .map(item => {
          return tryProcessProp(item, name, media, internal);
        })
        .flat(1);
    } else {
      throw path.get("value").buildCodeFrameError("Vasille: Exprected object expression");
    }
  }

  return processValue(name, path.get("value") as NodePath<types.Expression>, pseudo, "", media, [], true, internal);
}

export function findStyleInNode(path: NodePath<types.Node | null | undefined>, internal: Internal) {
  if (t.isExpressionStatement(path.node)) {
    return findStyleInNode((path as NodePath<types.ExpressionStatement>).get("expression"), internal);
  }
  if (t.isExportNamedDeclaration(path.node)) {
    return findStyleInNode((path as NodePath<types.ExportNamedDeclaration>).get("declaration"), internal);
  }

  if (
    t.isVariableDeclaration(path.node) &&
    path.node.declarations.length === 1 &&
    calls(path.node.declarations[0].init, ["webStyleSheet"], internal)
  ) {
    const call = path.node.declarations[0].init as types.CallExpression;
    const callPath = (path as NodePath<types.VariableDeclaration>)
      .get("declarations")[0]
      .get("init") as NodePath<types.CallExpression>;
    const objPath = callPath.get("arguments")[0] as NodePath<types.ObjectExpression>;

    if (call.arguments.length !== 1) {
      throw callPath.buildCodeFrameError("Vasille: webStyleSheet function has 1 parameter");
    }
    if (!t.isObjectExpression(call.arguments[0])) {
      throw objPath.buildCodeFrameError("Vasille: expected object expression");
    }

    for (const path of objPath.get("properties")) {
      if (!t.isObjectProperty(path.node)) {
        throw path.buildCodeFrameError("Vasille: Expected object property");
      }
      const prop = path as NodePath<types.ObjectProperty>;

      if (!t.isObjectExpression(prop.node.value)) {
        throw prop.get("value").buildCodeFrameError("Vasille: Exprected object expression");
      }
      if (!(t.isIdentifier(prop.node.key) || t.isStringLiteral(prop.node.key))) {
        throw prop.get("key").buildCodeFrameError("Vasille: Expected identifier of string literal");
      }

      const unsorted: Rule[] = [];
      const sorted: {
        [defaultMediaRule: number]: {
          [mediaRule: string]: {
            [theme: string]: {
              [pseudo: string]: string[];
            };
          };
        };
      } = {};

      for (const path of (prop.get("value") as NodePath<types.ObjectExpression>).get("properties")) {
        unsorted.push(...tryProcessProp(path, "", "", internal));
      }
      for (const rule of unsorted) {
        if (!sorted[rule.defaultMediaRule]) {
          sorted[rule.defaultMediaRule] = {};
        }

        const defaultMediaRule = sorted[rule.defaultMediaRule];

        if (!defaultMediaRule[rule.mediaRule]) {
          defaultMediaRule[rule.mediaRule] = {};
        }

        const mediaRule = defaultMediaRule[rule.mediaRule];

        if (!mediaRule[rule.theme]) {
          mediaRule[rule.theme] = {};
        }

        const theme = mediaRule[rule.theme];

        if (!theme[rule.pseudo]) {
          theme[rule.pseudo] = [];
        }

        theme[rule.pseudo].push(rule.rule);
      }

      const expressions: types.Expression[] = [];

      for (const defaultMediaRule in sorted) {
        for (const mediaRule in sorted[defaultMediaRule]) {
          for (const theme in sorted[defaultMediaRule][mediaRule]) {
            for (const pseudo in sorted[defaultMediaRule][mediaRule][theme]) {
              const rulePack = sorted[defaultMediaRule][mediaRule][theme][pseudo].join(";");
              const pseudoPack = pseudo ? `.{}${pseudo}{${rulePack}}` : `.{}{${rulePack}}`;
              const themePack = theme ? `${theme} ${pseudoPack}` : pseudoPack;
              const mediaRulePack = t.stringLiteral(mediaRule ? `${mediaRule}{${themePack}}` : themePack);

              expressions.push(
                defaultMediaRule !== "0"
                  ? t.arrayExpression([t.numericLiteral(parseInt(defaultMediaRule)), mediaRulePack])
                  : mediaRulePack,
              );
            }
          }
        }
      }

      prop.get("value").replaceWith(t.arrayExpression(expressions));
    }

    return true;
  }

  return false;
}
