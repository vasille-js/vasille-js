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
        this.seal();
    }

    public destroy () {
        this.nodes.clear();
        super.destroy ();
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
    public slot : Slot<Fragment, T, IdT>;

    /**
     * If false will use timeout executor, otherwise the app executor
     */
    public freezeUi = true;

    public constructor ($ ?: RepeatNodePrivate<IdT>) {
        super($ || new RepeatNodePrivate);

        this.slot = new Slot;
    }

    public createChild (id : IdT, item : T, before ?: Fragment) : any {
        // TODO: Refactor: remove @ts-ignore

        const node = new Fragment();

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

        const callback = () => {
            this.slot.release(node, item, id);
            node.ready();
        };

        if (this.freezeUi) {
            this.$.app.run.callCallback(callback);
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
            child.remove();
            child.destroy();
            this.$.nodes.delete(id);
            this.children.delete(child);
        }
    }
}

