import { RepeatNode, RepeatNodePrivate } from "./repeat-node";
import { IValue } from "../core/ivalue";
/**
 * Private part of repeater
 * @class RepeaterPrivate
 * @extends RepeatNodePrivate
 */
export declare class RepeaterPrivate<IdT> extends RepeatNodePrivate<IdT> {
    /**
     * Handler to catch count updates
     */
    updateHandler: (value: number) => void;
    /**
     * Current count of child nodes
     */
    currentCount: number;
    constructor();
}
/**
 * The simplest repeat node interpretation, repeat children pack a several times
 * @class Repeater
 * @extends RepeatNode
 */
export declare class Repeater extends RepeatNode<number, number> {
    protected $: RepeaterPrivate<number>;
    /**
     * The count of children
     */
    count: IValue<number>;
    constructor($?: RepeaterPrivate<number>);
    /**
     * Changes the children count
     */
    changeCount(number: number): void;
    $created(): void;
    $ready(): void;
    $destroy(): void;
}
