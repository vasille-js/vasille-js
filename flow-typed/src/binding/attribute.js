// @flow
import { Binding } from "./binding";
import type { INode } from "../node/node";
import type { IValue } from "../core/ivalue";



declare export class AttributeBinding extends Binding<?string> {
    constructor (
        node : INode,
        name : string,
        value : IValue<?string>
    ) : void;

    bound (name : string) : (rt : INode, ts : INode, value : ?string) => void;
}
