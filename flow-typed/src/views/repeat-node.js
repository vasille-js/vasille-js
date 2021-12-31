// @flow

import { Fragment, INodePrivate } from "../node/node";
import { Slot } from "../core/slot";



declare export class RepeatNodeItem extends Fragment {
    $id : any;

    constructor (id : any) : void;
}

declare export class RepeatNodePrivate<IdT> extends INodePrivate {
    nodes : Map<IdT, Fragment>;

    constructor () : void;
}

declare export class RepeatNode<IdT, T> extends Fragment {
    slot : Slot<T, IdT>;
    freezeUi : boolean;

    constructor ($ : ?RepeatNodePrivate<IdT>) : void;

    createChild (id : IdT, item : T, before : ?Fragment) : any;
    destroyChild (id : IdT, item : T) : void;
}

