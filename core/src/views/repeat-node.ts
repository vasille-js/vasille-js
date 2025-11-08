import { safe } from "../functional/safety.js";
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
> extends Fragment<Node, Element, TagOptions> {
    /**
     * Children node hash
     * @type {Map}
     */
    protected nodes: Map<IdT, Fragment<Node, Element, TagOptions>> = new Map();
    protected slot: ((ctx: Fragment<Node, Element, TagOptions>, value: T, index: IdT) => void) | undefined;

    public constructor(input: Opts, runner: Runner<Node, Element, TagOptions>) {
        super(runner);
        this.slot = input.slot && safe(input.slot);
    }

    public createChild(id: IdT, item: T, before?: Fragment<Node, Element, TagOptions>): any {
        const node = this.newChild(id, item);

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
        this.slot?.(node, item, id);
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

    public override destroy(): void {
        this.nodes.clear();
    }

    protected newChild(_id: IdT, _item: T): Fragment<Node, Element, TagOptions> {
        return new Fragment(this.runner);
    }
}
