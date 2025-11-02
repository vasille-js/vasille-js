import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";

export type VariableState = Record<string, 1>;

export class StackedStates {
  private maps: Map<string, VariableState>[] = [];

  public constructor() {
    this.push();
  }

  public push() {
    this.maps.push(new Map<string, VariableState>());
  }

  public pop() {
    this.maps.pop();
  }

  public get(name: string): VariableState | undefined {
    for (let i = this.maps.length - 1; i >= 0; i--) {
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
  devMode: boolean;
  strictFolders: boolean;
  stylesConnected: boolean;
  replaceWeb?: string;
  headTag?: boolean;
  bodyTag?: boolean;
  ref(arg?: types.Expression | null): types.CallExpression;
  expr(func: types.Expression, values: types.ArrayExpression): types.CallExpression;
  forward(arg: types.Expression): types.CallExpression;
  setModel(arg?: types.Expression | types.SpreadElement | types.ArgumentPlaceholder | null): types.CallExpression;
  mapModel(arg?: types.Expression | types.SpreadElement | types.ArgumentPlaceholder | null): types.CallExpression;
  arrayModel(arg?: types.Expression | types.SpreadElement | types.ArgumentPlaceholder | null): types.CallExpression;
  ensure(arg: types.Expression): types.CallExpression;
  match(name: types.Expression, arg?: types.Expression | null): types.CallExpression;
  set(obj: types.Expression, field: types.Expression, value: types.Expression): types.CallExpression;
  Switch(arg: types.ObjectExpression): types.CallExpression;
  safe(arg: types.FunctionExpression | types.ArrowFunctionExpression): types.CallExpression;
}

export const ctx = t.identifier("Vasille");
