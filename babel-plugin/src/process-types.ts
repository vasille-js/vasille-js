import { types } from "@babel/core";
import {
  isIdentifier,
  isTSBooleanKeyword,
  isTSNullKeyword,
  isTSNumberKeyword,
  isTSPropertySignature,
  isTSStringKeyword,
  isTSUndefinedKeyword,
  isTSUnionType,
  numericLiteral,
  objectExpression,
  objectProperty,
  stringLiteral,
  TSTypeElement,
} from "@babel/types";
import { Internal } from "./internal";

const any = 0;
const string = 1;
const number = 2;
const boolean = 3;
type PropType = typeof string | typeof number | typeof boolean | typeof any;

export function registerInterface(name: string, members: TSTypeElement[], internal: Internal) {
  internal.interfaces.set(name, members);
}

export function processUnion(type: types.TSUnionType): PropType {
  let isString = false;
  let isNumber = false;
  let isBoolean = false;
  let isAny = false;

  for (const keyword of type.types) {
    if (isTSStringKeyword(keyword)) {
      isString = true;
    } else if (isTSNumberKeyword(keyword)) {
      isNumber = true;
    } else if (isTSBooleanKeyword(keyword)) {
      isBoolean = true;
    } else if (!isTSNullKeyword(keyword) && !isTSUndefinedKeyword(keyword)) {
      isAny = true;
    }
  }

  if (isAny) {
    return any;
  }
  if (isString) {
    return string;
  }
  if (isNumber && !isBoolean) {
    return number;
  }
  if (isBoolean && !isNumber) {
    return boolean;
  }

  return any;
}

export function processType(type: types.TSType): PropType {
  if (isTSUnionType(type)) {
    return processUnion(type);
  }
  if (isTSStringKeyword(type)) {
    return string;
  }
  if (isTSNumberKeyword(type)) {
    return number;
  }
  if (isTSBooleanKeyword(type)) {
    return boolean;
  }

  return any;
}

export function processSignatures(members: TSTypeElement[]) {
  const props: types.ObjectProperty[] = [];

  for (const member of members) {
    if (isTSPropertySignature(member)) {
      props.push(
        objectProperty(
          member.key,
          numericLiteral(member.typeAnnotation ? processType(member.typeAnnotation.typeAnnotation) : any),
        ),
      );
    }
  }

  return objectExpression(props);
}

export function processTypeLiteral(literal: types.TSTypeLiteral) {
  return processSignatures(literal.members);
}

export function processReference(id: types.TSTypeReference, internal: Internal) {
  /* istanbul ignore else */
  if (isIdentifier(id.typeName)) {
    const members = internal.interfaces.get(id.typeName.name);

    return members ? processSignatures(members) : undefined;
  }
}
