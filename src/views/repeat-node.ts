import { Fragment, FragmentPrivate, INodePrivate } from "../node/node";
import { Slot } from "../core/slot";
import { timeoutExecutor } from "../core/executor";



/**
 * Defines an abstract node, which represents a dynamical part of application
 * @class RepeatNodeItem
 * @extends Fragment
 */
export class RepeatNodeItem extends Fragment {
    /**
     * node identifier
     * @type {*}
     */
    public $id : any;

    /**
     * Constructs a repeat node item
     * @param id {*}
     */
    public constructor (id : any) {
        super();
        this.$id = id;
        this.$seal();
    }

    /**
     * Destroy all children
     */
    public $destroy () {
        this.$id = null;
        super.$destroy();
    }
}

/**
 * Private part of repeat node
 * @class RepeatNodePrivate
 * @extends INodePrivate
 */
export class RepeatNodePrivate<IdT> extends INodePrivate {
    /**
     * Children node hash
     * @type {Map}
     */
    public nodes : Map<IdT, Fragment> = new Map();

    public constructor () {
        super ();
        this.$seal();
    }

    public $destroy () {
        this.nodes.clear();
        super.$destroy ();
    }
}

/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
export class RepeatNode<IdT, T> extends Fragment {
    protected $ : RepeatNodePrivate<IdT>;

    /**
     * Default slot
     */
    public slot : Slot<T, IdT>;

    /**
     * If false will use timeout executor, otherwise the app executor
     */
    public freezeUi : boolean = true;

    public constructor ($ ?: RepeatNodePrivate<IdT>) {
        super($ || new RepeatNodePrivate);

        this.slot = new Slot;
    }

    public createChild (id : IdT, item : T, before ?: Fragment) : any {
        let current : Fragment = this.$.nodes.get(id);
        let node = new RepeatNodeItem(id);
        // @ts-ignore
        let $ : FragmentPrivate = node.$;

        this.destroyChild(id, item);

        if (current) {
            // @ts-ignore
            const current$ = current.$;

            $.next = current$.next;
            $.prev = current$.prev;
            if ($.next) {
                // @ts-ignore
                $.next.$.prev = node;
            }
            if ($.prev) {
                // @ts-ignore
                $.prev.$.next = node;
            }
            current.$destroy();
            this.$children.splice(this.$children.indexOf(current), 1, node);
        }
        else if (before) {
            $.next = before;
            // @ts-ignore
            $.prev = before.$.prev;
            // @ts-ignore
            before.$.prev = node;
            if ($.prev) {
                // @ts-ignore
                $.prev.$.next = node;
            }
            this.$children.splice(this.$children.indexOf(before) - 1, 0, node);
        }
        else {
            let lastChild = this.$children[this.$children.length - 1];

            if (lastChild) {
                // @ts-ignore
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

    public destroyChild (id : IdT, item : T) {
        let $ : RepeatNodePrivate<IdT> = this.$;
        let child = $.nodes.get(id);

        if (child) {
            // @ts-ignore
            let $ : FragmentPrivate = child.$;

            if ($.prev) {
                // @ts-ignore
                $.prev.$.next = $.next;
            }
            if ($.next) {
                // @ts-ignore
                $.next.$.prev = $.prev;
            }
            child.$destroy();
            this.$.nodes.delete(id);
            this.$children.splice(this.$children.indexOf(child), 1);
        }
    }
}

