import { NodePath, types } from "@babel/core";

export const enum VariableState {
    Ignored = 1,
    Reactive = 2,
    ReactiveObject = 3,
}

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
    id: types.Expression;
    global: string;
    prefix: string;
    internalUsed: boolean;
    importStatement: NodePath<types.ImportDeclaration> | null;
}
