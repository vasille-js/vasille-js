import { NodePath, types } from "@babel/core";
import * as t from "@babel/types";

export const enum VariableState {
  Ignored = 1,
  Reactive = 2,
  ReactiveObject = 3,
  ReactivePointer = 4,
}

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
  id: types.Expression;
  global: string;
  cssGlobal: string;
  prefix: string;
  internalUsed: boolean;
  importStatement: NodePath<types.ImportDeclaration> | null;
  stateOnly: boolean;
  devMode: boolean;
}

export const ctx = t.identifier("Vasille");
