import { Fragment, INodePrivate } from "../node/node";
import { Slot } from "../core/slot";
/**
 * Private part of repeat node
 * @class RepeatNodePrivate
 * @extends INodePrivate
 */
export declare class RepeatNodePrivate<IdT> extends INodePrivate {
    /**
     * Children node hash
     * @type {Map}
     */
    nodes: Map<IdT, Fragment>;
    constructor();
    $destroy(): void;
}
/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
export declare class RepeatNode<IdT, T> extends Fragment {
    protected $: RepeatNodePrivate<IdT>;
    /**
     * Default slot
     */
    slot: Slot<Fragment, T, IdT>;
    /**
     * If false will use timeout executor, otherwise the app executor
     */
    freezeUi: boolean;
    constructor($?: RepeatNodePrivate<IdT>);
    createChild(id: IdT, item: T, before?: Fragment): any;
    destroyChild(id: IdT, item: T): void;
}
