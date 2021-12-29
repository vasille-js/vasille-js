// @flow
import { RepeatNode, RepeatNodePrivate } from "./repeat-node";
import { Reference } from "../value/reference";
import { IValue } from "../core/ivalue";



/**
 * Private part of repeater
 */
export class RepeaterPrivate<IdT> extends RepeatNodePrivate<IdT> {
    /**
     * Handler to catch count updates
     * @type {Function}
     */
    updateHandler : (value: number) => void;

    /**
     * Current count of child nodes
     * @type {number}
     */
    currentCount : number = 0;

    constructor () {
        super ();
        this.$seal();
    }
}

/**
 * The simplest repeat $node interpretation, repeat children pack a several times
 */
export class Repeater extends RepeatNode<number, number> {

    /**
     * The count of children
     * @type {IValue<number>}
     */
    count : IValue<number> = new Reference(0);

    constructor ($ : ?RepeaterPrivate<number>) {
        super($ || new RepeaterPrivate);
        this.$seal();
    }

    /**
     * Changes the children count
     * @param number {number} The new children count
     */
    changeCount (number : number) {
        let $ : RepeaterPrivate<number> = this.$;

        if (number > $.currentCount) {
            for (let i = $.currentCount; i < number; i++) {
                this.createChild(i, i);
            }
        }
        else {
            for (let i = $.currentCount - 1; i >= number; i--) {
                this.destroyChild(i, i);
            }
        }
        $.currentCount = number;
    }



    /**
     * Handles created event
     */
    $created () {
        let $ : RepeaterPrivate<number> = this.$;

        super.$created();

        $.updateHandler = (value : number) => {
            this.changeCount(value);
        };
        this.count.on($.updateHandler);
    }

    /**
     * Handles ready event
     */
    $ready () {
        this.changeCount(this.count.$);
    }

    /**
     * Handles destroy event
     */
    $destroy () {
        let $ : RepeaterPrivate<number> = this.$;

        super.$destroy();
        this.count.off($.updateHandler);
    }
}

