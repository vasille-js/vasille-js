import { Fragment, INodePrivate } from "../node/node";
import { FragmentOptions } from "../functional/options";



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

// RNO = RepeatNodeOptions
export interface RNO<T, IdT> extends FragmentOptions {
    slot ?: (node : Fragment, value : T, index : IdT) => void
}

/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
export class RepeatNode<IdT, T, Opts extends RNO<T, IdT> = RNO<T, IdT>> extends Fragment<Opts> {
    protected $ : RepeatNodePrivate<IdT>;

    /**
     * If false will use timeout executor, otherwise the app executor
     */
    public freezeUi = true;

    public constructor (input : Opts, $ : RepeatNodePrivate<IdT>) {
        super(input, $);
    }

    public createChild (opts : Opts, id : IdT, item : T, before ?: Fragment) : any {

        const node = new Fragment({});

        this.destroyChild(id, item);

        if (before) {
            this.children.add(node);
            before.insertBefore(node);
        }
        else {
            const lastChild = this.lastChild;

            if (lastChild) {
                lastChild.insertAfter(node);
            }
            this.children.add(node);
        }

        this.lastChild = node;
        node.preinit(this.$.app, this);
        node.init();

        opts.slot && opts.slot(node, item, id);
        node.ready();

        this.$.nodes.set(id, node);
    }

    public destroyChild (id : IdT, item : T) {
        const $ : RepeatNodePrivate<IdT> = this.$;
        const child = $.nodes.get(id);

        if (child) {
            child.remove();
            child.$destroy();
            this.$.nodes.delete(id);
            this.children.delete(child);
        }
    }
}

