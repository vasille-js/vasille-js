import { config } from "../core/config";
import { Fragment, Root } from "../node/node";

// RNO = RepeatNodeOptions
export interface RepeatNodeOptions<T, IdT> {
    slot?: (this: Fragment, value: T, index: IdT) => void;
}

/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
export class RepeatNode<
    IdT,
    T,
    Opts extends RepeatNodeOptions<T, IdT> = RepeatNodeOptions<T, IdT>,
> extends Fragment<Opts> {
    /**
     * Children node hash
     * @type {Map}
     */
    protected nodes: Map<IdT, Fragment> = new Map();

    public constructor(input: Opts, name?: string) {
        super(input, name);
    }

    public createChild(opts: Opts, id: IdT, item: T, before?: Fragment): any {
        const _id = id && typeof id === "object" && "id" in id ? id.id : config.debugUi ? JSON.stringify(id) : id;
        const node = new Fragment({}, `${_id}`);

        node.parent = this;
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

        opts.slot && opts.slot.call(node, item, id);

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
