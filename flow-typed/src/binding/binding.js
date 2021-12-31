// @flow
import { Destroyable } from "../core/destroyable";
import type { IValue } from "../core/ivalue";
import type { INode } from "../node/node";



declare export class Binding<T> extends Destroyable {
    binding : IValue<T>;
    updateFunc : (value: T) => void;

    constructor (
        node : INode,
        name : string,
        value : IValue<T>
    ) : void;
    
    bound (name : string) : (rt : INode, ts : INode, value : T) => void;
    $destroy () : void;
}
