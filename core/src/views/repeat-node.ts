import { Fragment } from "../node/node";
import { FragmentOptions } from "../functional/options";

// RNO = RepeatNodeOptions
export interface RNO<T, IdT> extends FragmentOptions {
    slot?: (node: Fragment, value: T, index: IdT) => void;
}

/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
export class RepeatNode<IdT, T, Opts extends RNO<T, IdT> = RNO<T, IdT>> extends Fragment<Opts> {
    /**
     * Children node hash
     * @type {Map}
     */
    protected nodes: Map<IdT, Fragment> = new Map();

    public constructor(input: Opts) {
        super(input);
    }

    public createChild(opts: Opts, id: IdT, item: T, before?: Fragment): any {
        const node = new Fragment({});

        this.destroyChild(id, item);

        if (before) {
            this.children.add(node);
            before.insertBefore(node);
        } else {
            const lastChild = this.lastChild;

            if (lastChild) {
                lastChild.insertAfter(node);
            }
            this.children.add(node);
        }

        this.lastChild = node;
        node.preinit(this);
        node.init();

        opts.slot && opts.slot(node, item, id);
        node.ready();

        this.nodes.set(id, node);
    }

    public destroyChild(id: IdT, item: T) {
        const child = this.nodes.get(id);

        if (child) {
            child.remove();
            child.destroy();
            this.nodes.delete(id);
            this.children.delete(child);
        }
    }

    public destroy(): void {
        this.nodes.clear();
    }
}
