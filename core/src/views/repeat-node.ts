import { Fragment } from "../node/node.js";
import { Runner } from "../node/runner.js";

// RNO = RepeatNodeOptions
export interface RepeatNodeOptions<Node, Element, TagOptions extends object, T, IdT> {
    slot?: (ctx: Fragment<Node, Element, TagOptions>, value: T, index: IdT) => void;
}

/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
export class RepeatNode<
    Node,
    Element,
    TagOptions extends object,
    IdT,
    T,
    Opts extends RepeatNodeOptions<Node, Element, TagOptions, T, IdT> = RepeatNodeOptions<
        Node,
        Element,
        TagOptions,
        T,
        IdT
    >,
> extends Fragment<Node, Element, TagOptions, Opts> {
    /**
     * Children node hash
     * @type {Map}
     */
    protected nodes: Map<IdT, Fragment<Node, Element, TagOptions>> = new Map();

    public constructor(input: Opts, runner: Runner<Node, Element, TagOptions>, name?: string) {
        super(input, runner, name);
    }

    public createChild(opts: Opts, id: IdT, item: T, before?: Fragment<Node, Element, TagOptions>): any {
        const _id = id && typeof id === "object" && "id" in id ? id.id : id;
        const node = new Fragment({}, this.runner, `${_id}`);

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

        opts.slot && opts.slot(node, item, id);

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
