// @flow
import { RepeatNode, RepeatNodePrivate } from "./repeat-node";



declare export class BaseViewPrivate<K, T> extends RepeatNodePrivate<K> {
    addHandler : (index : K, value : T) => void;
    removeHandler : (index : K, value : T) => void;

    constructor () : void;
}

declare export class BaseView<K, T, Model> extends RepeatNode<K, T> {
    model : Model;

    constructor ($1 : ?BaseViewPrivate<K, T>) : void;
}
