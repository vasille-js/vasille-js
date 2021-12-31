import { Fragment, FragmentPrivate, INodePrivate } from "../node/node";
import { Slot } from "../core/slot";
import { timeoutExecutor } from "../core/executor";



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
    public freezeUi = true;

    public constructor ($ ?: RepeatNodePrivate<IdT>) {
        super($ || new RepeatNodePrivate);

        this.slot = new Slot;
    }

    public createChild (id : IdT, item : T, before ?: Fragment) : any {
        const current : Fragment = this.$.nodes.get(id);
        const node = new Fragment();

        // TODO: Refactor: remove @ts-ignore

        // eslint-disable-next-line
        // @ts-ignore
        const $ : FragmentPrivate = node.$;

        this.destroyChild(id, item);

        if (current) {
            // eslint-disable-next-line
            // @ts-ignore
            const current$ = current.$;

            $.next = current$.next;
            $.prev = current$.prev;
            if ($.next) {
                // eslint-disable-next-line
                // @ts-ignore
                $.next.$.prev = node;
            }
            if ($.prev) {
                // eslint-disable-next-line
                // @ts-ignore
                $.prev.$.next = node;
            }
            current.$destroy();
            this.$children.splice(this.$children.indexOf(current), 1, node);
        }
        else if (before) {
            $.next = before;
            // eslint-disable-next-line
            // @ts-ignore
            $.prev = before.$.prev;
            // eslint-disable-next-line
            // @ts-ignore
            before.$.prev = node;
            if ($.prev) {
                // eslint-disable-next-line
                // @ts-ignore
                $.prev.$.next = node;
            }
            this.$children.splice(this.$children.indexOf(before) - 1, 0, node);
        }
        else {
            const lastChild = this.$children[this.$children.length - 1];

            if (lastChild) {
                // eslint-disable-next-line
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
    }

    public destroyChild (id : IdT, item : T) {
        const $ : RepeatNodePrivate<IdT> = this.$;
        const child = $.nodes.get(id);

        if (child) {
            // eslint-disable-next-line
            // @ts-ignore
            const $ : FragmentPrivate = child.$;

            if ($.prev) {
                // eslint-disable-next-line
                // @ts-ignore
                $.prev.$.next = $.next;
            }
            if ($.next) {
                // eslint-disable-next-line
                // @ts-ignore
                $.next.$.prev = $.prev;
            }
            child.$destroy();
            this.$.nodes.delete(id);
            this.$children.splice(this.$children.indexOf(child), 1);
        }
    }
}

