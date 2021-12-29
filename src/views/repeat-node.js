// @flow

import { Fragment, FragmentPrivate, INodePrivate } from "../node/node";
import { Slot } from "../core/slot";
import { timeoutExecutor } from "../core/executor";



/**
 * Defines an abstract node, which represents a dynamical part of application
 */
export class RepeatNodeItem extends Fragment {
    /**
     * node identifier
     * @type {*}
     */
    $id : any;

    /**
     * Constructs a repeat node item
     * @param id {*}
     */
    constructor (id : any) {
        super();
        this.$id = id;
        this.$seal();
    }

    /**
     * Destroy all children
     */
    $destroy () {
        this.$id = null;
        super.$destroy();
    }
}

export class RepeatNodePrivate<IdT> extends INodePrivate {
    /**
     * Children node hash
     * @type {Map<*, Extension>}
     */
    nodes : Map<IdT, Fragment> = new Map();

    constructor () {
        super ();
        this.$seal();
    }

    $destroy () {
        this.nodes.clear();
        super.$destroy ();
    }
}

/**
 * Repeat node repeats its children
 */
export class RepeatNode<IdT, T> extends Fragment {
    slot : Slot<T, IdT>;
    freezeUi : boolean = true;

    constructor ($ : ?RepeatNodePrivate<IdT>) {
        super($ || new RepeatNodePrivate);

        this.slot = new Slot;
    }

    /**
     * Create a children pack
     * @param id {*} id of child pack
     * @param item {IValue<*>} value for children pack
     * @param before {Fragment} Node to insert before it
     */
    createChild (id : IdT, item : T, before : ?Fragment) : any {
        let current : ?Fragment = this.$.nodes.get(id);
        let node = new RepeatNodeItem(id);
        let $ : RepeatNodePrivate<IdT> = node.$;

        this.destroyChild(id, item);

        if (current) {
            $.next = current.$.next;
            $.prev = current.$.prev;
            if ($.next) {
                $.next.$.prev = node;
            }
            if ($.prev) {
                $.prev.$.next = node;
            }
            current.$destroy();
            this.$children.splice(this.$children.indexOf(current), 1, node);
        }
        else if (before) {
            $.next = before;
            $.prev = before.$.prev;
            before.$.prev = node;
            if ($.prev) {
                $.prev.$.next = node;
            }
            this.$children.splice(this.$children.indexOf(before) - 1, 0, node);
        }
        else {
            let lastChild = this.$children[this.$children.length - 1];

            if (lastChild) {
                lastChild.$.next = node;
            }
            $.prev = lastChild;
            this.$children.push(node);
        }

        node.$preinit(this.$.app, this);
        node.$init();

        const callback = () => {
            this.slot.release(node, item, id);
            node.$ready();
        };

        if (this.freezeUi) {
            this.$.app.$run.callCallback(callback);
        }
        else {
            timeoutExecutor.callCallback(callback);
        }

        this.$.nodes.set(id, node);
    };

    /**
     * Destroy an old child
     * @param id {*} id of children pack
     * @param item {IValue<*>} value of children pack
     */
    destroyChild (id : IdT, item : T) {
        let $ : RepeatNodePrivate<IdT> = this.$;
        let child = $.nodes.get(id);

        if (child) {
            let $ : FragmentPrivate = child.$;

            if ($.prev) {
                $.prev.$.next = $.next;
            }
            if ($.next) {
                $.next.$.prev = $.prev;
            }
            child.$destroy();
            this.$.nodes.delete(id);
            this.$children.splice(this.$children.indexOf(child), 1);
        }
    }
}

