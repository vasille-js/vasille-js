import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";
export declare class StaticClassBinding extends Binding<boolean> {
    private current;
    constructor(node: INode, name: string, value: IValue<boolean>);
}
export declare class DynamicalClassBinding extends Binding<string> {
    private current;
    constructor(node: INode, value: IValue<string>);
}
