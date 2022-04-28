import { Fragment, INodePrivate } from "../node/node";
import { Options } from "../functional/options";
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
    destroy(): void;
}
export interface RNO<T, IdT> extends Options {
    slot?: (node: Fragment, value: T, index: IdT) => void;
}
/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
export declare class RepeatNode<IdT, T, Opts extends RNO<T, IdT> = RNO<T, IdT>> extends Fragment<Opts> {
    protected $: RepeatNodePrivate<IdT>;
    /**
     * If false will use timeout executor, otherwise the app executor
     */
    freezeUi: boolean;
    constructor(input: Opts, $: RepeatNodePrivate<IdT>);
    createChild(opts: Opts, id: IdT, item: T, before?: Fragment): any;
    destroyChild(id: IdT, item: T): void;
}
