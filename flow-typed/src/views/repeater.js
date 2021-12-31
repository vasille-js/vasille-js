// @flow
import { RepeatNode, RepeatNodePrivate } from "./repeat-node";
import { IValue } from "../core/ivalue";



declare export class RepeaterPrivate<IdT> extends RepeatNodePrivate<IdT> {
    updateHandler : (value: number) => void;
    currentCount : number;

    constructor () : void;
}

declare export class Repeater extends RepeatNode<number, number> {
    count : IValue<number>;

    constructor ($ : ?RepeaterPrivate<number>) : void;

    changeCount (number : number) : void;
}

