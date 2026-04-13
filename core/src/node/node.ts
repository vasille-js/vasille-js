import { Reactive } from "../core/core.js";
import { IValue } from "../core/ivalue.js";
import { reportError, safe } from "../functional/safety.js";
import { Reference } from "../value/reference.js";
import { IRunner } from "./runner.js";

/**
 * This class is symbolic
 * @extends Reactive
 */
export abstract class Root<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends Reactive {
    /**
     * The children list
     * @type Array
     */
    public readonly children: Fragment<Node, Element, TagOptions>[] = [];
    public readonly runner: Runner;

    public lastChild: Fragment<Node, Element, TagOptions> | undefined = undefined;

    protected constructor(runner: Runner) {
        super();
        this.runner = runner;
    }

    /**
     * Pushes a node to children immediately
     * @param fragment {Fragment} A node to push
     * @protected
     */
    protected push(fragment: Fragment<Node, Element, TagOptions>): void {
        fragment.parent = this;
        this.lastChild = fragment;
        this.children.push(fragment);
    }

    /**
     * Find the first node in the element if so exists
     * @return {?Element}
     * @protected
     */
    protected findFirstChild(): Node | Element | undefined {
        let first: Node | Element | undefined;

        this.children.forEach(child => {
            first = first ?? child.findFirstChild();
        });

        return first;
    }

    /**
     * Append a node to the end of element
     * @param node {Node} node to insert
     */
    public abstract appendNode(node: Node): void;

    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     */
    public text(text: unknown): void {
        const node = this.runner.textNode(text);

        this.push(node);
        node.compose();
    }

    /**
     * Defines a safe text fragment
     * @param fn a function that returns a text fragment string
     */
    public sText(fn: () => unknown): void {
        try {
            this.text(fn());
        } catch (e) {
            reportError(e);
        }
    }

    /**
     * Defines a tag element
     * @param tagName {String} the tag name
     * @param input
     * @param cb {function(Tag, *)} callback
     */
    public tag(tagName: string, input: TagOptions, cb?: (ctx: Tag<Node, Element, TagOptions>) => void): void {
        const tag = this.runner.tag(tagName, input, cb);

        this.push(tag);
        tag.compose();
    }

    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     */
    public create<T extends Fragment<Node, Element, TagOptions>>(node: T, callback?: (ctx: T) => void): void {
        this.push(node);
        node.compose();
        callback?.(node);
    }

    public override destroy(keepNodes?: boolean) {
        this.children.forEach(child => child.destroy(keepNodes));

        this.children.splice(0);
        this.lastChild = undefined;
        super.destroy();
    }
}

export class Fragment<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends Root<Node, Element, TagOptions, Runner> {
    public parent!: Root<Node, Element, TagOptions>;

    public constructor(runner: Runner) {
        super(runner);
    }

    /**
     * Next node
     * @type {?Fragment}
     */
    public next?: Fragment<Node, Element, TagOptions>;

    /**
     * Previous node
     * @type {?Fragment}
     */
    public prev?: Fragment<Node, Element, TagOptions>;

    /**
     * Pushes a node to children immediately
     * @param fragment {Fragment} A node to push
     * @protected
     */
    protected override push(fragment: Fragment<Node, Element, TagOptions>): void {
        if (this.lastChild) {
            this.lastChild.next = fragment;
        }
        fragment.prev = this.lastChild;

        super.push(fragment);
    }

    /**
     * Append a node to the end of element
     * @param node {Node} node to insert
     */
    public appendNode(node: Node): void {
        if (this.next) {
            this.next.insertAdjacent(node);
        } else {
            this.parent.appendNode(node);
        }
    }

    /**
     * Insert a node as a sibling of this
     * @param node {Node} node to insert
     */
    public insertAdjacent(node: Node): void {
        const child = this.findFirstChild();

        if (child) {
            this.runner.insertBefore(node, child);
        } else if (this.next) {
            this.next.insertAdjacent(node);
        } else {
            this.parent.appendNode(node);
        }
    }

    public link(
        parent: Fragment<Node, Element, TagOptions>,
        prev: Fragment<Node, Element, TagOptions> | undefined,
        next: Fragment<Node, Element, TagOptions> | undefined,
    ) {
        this.parent = parent;
        this.prev = prev;
        this.next = next;
        if (prev) {
            prev.next = this;
        }
        if (next) {
            next.prev = this;
        }
    }

    public unlink() {
        const { prev, next } = this;

        if (prev) {
            prev.next = next;
        }
        if (next) {
            next.prev = prev;
        }
    }

    public unmount(keepStructure: boolean): void {
        if (!keepStructure) {
            this.unlink();
        }
        this.children.forEach(child => child.unmount(true));
    }
    public remount(): void {
        const children = this.children;
        for (let i = children.length - 1; i >= 0; i--) {
            children[i]!.remount();
        }
    }

    public compose() {
        // do nothing
        // to override it
    }
}

export interface TextProps {
    text: unknown;
}

/**
 * Represents a text node
 * @class TextNode
 * @extends Fragment
 */
export abstract class TextNode<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends Fragment<Node, Element, TagOptions, Runner> {
    protected handler: ((v: unknown) => void) | null = null;
    protected readonly data: unknown;

    public constructor(input: TextProps, runner: Runner) {
        super(runner);
        this.data = input.text;
    }

    public abstract override compose(): void;

    protected abstract override findFirstChild(): Node;

    public override destroy(keepNodes?: boolean): void {
        const text = this.data;

        if (text instanceof IValue && this.handler) {
            text.off(this.handler);
        }

        super.destroy(keepNodes);
    }
}

/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
export abstract class Tag<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends Fragment<Node, Element, TagOptions, Runner> {
    public readonly name: string;
    public readonly options: TagOptions;

    /**
     * The element of vasille node
     * @type Element
     */
    public node: Element | undefined;

    public constructor(options: TagOptions, runner: Runner, tagName: string) {
        super(runner);
        this.options = options;
        this.name = tagName;
    }

    public abstract override compose(): void;

    public override insertAdjacent(node: Node): void {
        this.runner.insertBefore(node, this.node!);
    }

    protected override findFirstChild(): Node | Element | undefined {
        return this.node;
    }

    public override appendNode(node: Node): void {
        this.runner.appendChild(this.node!, node);
    }
}

export interface SwitchedNodeCase<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions>,
> {
    $case: unknown;
    slot: (node: Fragment<Node, Element, TagOptions, Runner>, value?: unknown) => void;
}

/**
 * Defines a node which can switch its children conditionally
 */
export class SwitchedNode<
    Node,
    Element,
    TagOptions extends object,
    Runner extends IRunner<Node, Element, TagOptions> = IRunner<Node, Element, TagOptions>,
> extends Fragment<Node, Element, TagOptions, Runner> {
    /**
     * Index of current true condition
     * @type number
     */
    private index: number = -1;

    /**
     * Array of possible cases
     * @type {Array<{cond : IValue<unknown>, cb : function(Fragment)}>}
     */
    private cases: SwitchedNodeCase<Node, Element, TagOptions, Runner>[];

    /**
     * A function that syncs index and content will be bounded to each condition
     * @type {Function}
     */
    private readonly sync: () => void;

    /**
     * Constructs a switch node and define a sync function
     */
    public constructor(
        runner: Runner,
        cases: SwitchedNodeCase<Node, Element, TagOptions, Runner>[],
        _default?: (node: Fragment<Node, Element, TagOptions>) => void,
    ) {
        super(runner);

        if (_default) {
            cases.push({ $case: 1, slot: _default });
        }
        this.cases = cases;

        this.sync = () => {
            let i = this.cases.findIndex(item => (item.$case instanceof IValue ? item.$case.V : item.$case));

            if (i === this.index) {
                return;
            }

            if (this.lastChild) {
                this.lastChild.destroy();
                this.children.splice(0);
                this.lastChild = undefined;
            }

            if (i !== -1) {
                const node = this.newChild(i);
                const value = this.cases[i]!.$case;

                node.parent = this;
                this.lastChild = node;
                this.children.push(node);

                safe(this.cases[i]!.slot)(node, value instanceof IValue ? value.V : value);
            }
            this.index = i;
        };

        cases.forEach(_case => {
            const item = _case.$case;
            if (item instanceof IValue) {
                item.on(this.sync);
            }
        });
    }

    public override compose() {
        this.sync();
    }

    public override destroy(keepNodes?: boolean) {
        this.cases.forEach(c => {
            const item = c.$case;
            if (item instanceof IValue) {
                item.off(this.sync);
            }
        });
        this.cases.splice(0);

        super.destroy(keepNodes);
    }

    protected newChild(_index: number): Fragment<Node, Element, TagOptions, Runner> {
        return new Fragment(this.runner);
    }
}
