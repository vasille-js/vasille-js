// @flow
import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";



declare export class ClassBinding extends Binding<string | boolean> {
    current : ? string | boolean;

    constructor (
        node : INode,
        name : string,
        value : IValue<string | boolean>
    ) : void;

    bound (name : string) : (rt : INode, ts : INode, value : string | boolean) => void;
}
