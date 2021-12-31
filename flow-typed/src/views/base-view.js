// @flow
import { RepeatNode, RepeatNodePrivate } from "./repeat-node";
import { Listener } from "../models/listener";
import { IValue } from "../core/ivalue";
import { Fragment } from "../node/node";



declare export class BaseViewPrivate<K, T> extends RepeatNodePrivate<K> {
    addHandler : (index : K, value : T) => void;
    removeHandler : (index : K, value : T) => void;

    constructor () : void;
}

declare export class BaseView<K, T, Model> extends RepeatNode<K, T> {
    model : IValue<{ listener: Listener<T, K> } & Model>;

    constructor ($1 : ?BaseViewPrivate<K, T>) : void;

    createChild (id : K, item : T, before : ?Fragment) : () => void;
}
