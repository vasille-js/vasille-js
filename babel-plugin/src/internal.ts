import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";

export type VariableState = Record<string, 1>;

export class StackedStates {
  private maps: Map<string, VariableState>[] = [];
  private checkingIndex: number = 0;

  public constructor() {
    this.push();
  }

  public push(startChecking?: boolean) {
    if (startChecking) {
      this.checkingIndex = this.maps.length;
    }
    this.maps.push(new Map<string, VariableState>());
  }

  public pop() {
    this.maps.pop();
  }

  public get(name: string, checkingContextOnly?: boolean): VariableState | undefined {
    for (let i = this.maps.length - 1; i >= (checkingContextOnly ? this.checkingIndex : 0); i--) {
      if (this.maps[i].has(name)) {
        return this.maps[i].get(name);
      }
    }

    return undefined;
  }

  public set(name: string, state: VariableState) {
    this.maps[this.maps.length - 1].set(name, state);
  }
}

export interface Internal {
  // settings
  mapping: Map<string, string>;
  stack: StackedStates;
  global: string;
  prefix: string;
  importStatement: NodePath<types.ImportDeclaration> | null;
  stateOnly: boolean;
  isComposing?: boolean;
  isFunctionParsing?: boolean;
  firstError?: Error;
  filename: string;
  steelFilePath: string;
  devLayer: boolean;
  strictFolders: boolean;
  stylesConnected: boolean;
  replaceWeb: string;
  headTag?: boolean;
  bodyTag?: boolean;

  // reactivity
  ref(arg: types.Expression | null, area: types.Node, name: string | undefined): types.Expression;
  expr(
    func: types.Expression,
    values: types.Expression[],
    codes: string[],
    area: types.Node,
    name: string | undefined,
  ): types.Expression;

  // models
  setModel(
    arg: types.Expression | types.SpreadElement | types.ArgumentPlaceholder | null,
    usage: types.Node,
    name: string | undefined,
  ): types.Expression;
  mapModel(
    arg: types.Expression | types.SpreadElement | types.ArgumentPlaceholder | null,
    usage: types.Node,
    name: string | undefined,
  ): types.Expression;
  arrayModel(
    arg: types.Expression | types.SpreadElement | types.ArgumentPlaceholder | null,
    usage: types.Node,
    name: string | undefined,
  ): types.Expression;

  // helpers
  ensure(arg: types.MemberExpression | types.OptionalMemberExpression, area: types.Node): types.CallExpression;
  match(name: types.Expression, arg: types.Expression | null, area: types.Node): types.CallExpression;
  set(obj: types.Expression, field: types.Expression, value: types.Expression, area: types.Node): types.CallExpression;

  // components
  Switch(arg: types.ObjectExpression): types.CallExpression;

  // safety
  safe(arg: types.FunctionExpression | types.ArrowFunctionExpression): types.CallExpression;

  // dev helpers
  updateIValue(assign: types.AssignmentExpression, left: types.Expression, right: types.Expression): types.Expression;
  wrapFunctionBody(
    fn: types.FunctionDeclaration | types.ObjectMethod | types.ClassMethod | types.ClassPrivateMethod,
  ): void;
  wrapFunction(fn: types.FunctionExpression | types.ArrowFunctionExpression): types.Node;
  shareStateById(value: types.Expression, name: string): types.Expression;
  positionedText(text: types.Expression, area: types.Node): types.Expression;
  earlyInspector(): types.Expression;
}

export const ctx = t.identifier("Vasille");
export const runner = t.memberExpression(ctx, t.identifier("runner"));
export const inspector = t.memberExpression(runner, t.identifier("inspector"));
