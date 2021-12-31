// @flow



declare export class Listener<ValueT, IndexT = string | number> {
    onAdded : Set<(index : IndexT, value : ValueT) => void>;
    onRemoved : Set<(index : IndexT, value : ValueT) => void>;
    frozen : boolean;
    queue : { sign: boolean, index: IndexT, value: ValueT }[];

    constructor () : void;
    excludeRepeat (index : IndexT) : boolean;
    emitAdded (index : IndexT, value : ValueT) : void;
    emitRemoved (index : IndexT, value : ValueT) : void;
    onAdd (handler : (index : IndexT, value : ValueT) => void) : void;
    onRemove (handler : (index : IndexT, value : ValueT) => void) : void;
    offAdd (handler : (index : IndexT, value : ValueT) => void) : void;
    offRemove (handler : (index : IndexT, value : ValueT) => void) : void;
    enableReactivity () : void;
    disableReactivity () : void;
}
