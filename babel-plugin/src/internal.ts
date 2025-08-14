import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";

export type VariableState = Record<string, 1>;

export enum VariableScope {
  Any,
  Local,
  Global,
}

export class StackedStates {
  private maps: Map<string, VariableState>[] = [];
  private localIndex = -1;

  public constructor() {
    this.push();
  }

  public fixLocalIndex() {
    this.localIndex = this.maps.length;
  }

  public resetLocalIndex() {
    this.localIndex = -1;
  }

  public push() {
    this.maps.push(new Map<string, VariableState>());
  }

  public pop() {
    this.maps.pop();
  }

  public get(name: string, scope?: VariableScope): VariableState | undefined {
    for (
      let i =
        (this.localIndex === -1 || scope !== VariableScope.Global
          ? this.maps.length
          : Math.min(this.maps.length, this.localIndex)) - 1;
      i >= (this.localIndex === -1 || scope !== VariableScope.Local ? 0 : this.localIndex);
      i--
    ) {
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
  devMode: boolean;
  ref(arg?: types.Expression | null): types.CallExpression;
  expr(func: types.Expression, values: types.ArrayExpression): types.CallExpression;
  forward(arg: types.Expression): types.CallExpression;
  backward(arg: types.Expression): types.CallExpression;
  setModel(arg?: types.Expression | types.SpreadElement | types.ArgumentPlaceholder | null): types.CallExpression;
  mapModel(arg?: types.Expression | types.SpreadElement | types.ArgumentPlaceholder | null): types.CallExpression;
  arrayModel(arg?: types.Expression | types.SpreadElement | types.ArgumentPlaceholder | null): types.CallExpression;
  ensure(arg: types.Expression): types.CallExpression;
  match(name: types.Expression, arg?: types.Expression | null): types.CallExpression;
  set(obj: types.Expression, field: types.Expression, value: types.Expression): types.CallExpression;
}

export const ctx = t.identifier("Vasille");
