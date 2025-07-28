import { Reactive } from "../core/core";
import { IValue } from "../core/ivalue";
import { SetModel } from "../models/set-model";
import { Reference } from "../value/reference";
import { userError } from "../core/errors";
import { Runner } from "./runner";

/**
 * This class is symbolic
 * @extends Reactive
 */
export abstract class Root<Node, Element, TagOptions extends object, T extends object = object> extends Reactive<T> {
    /**
     * The children list
     * @type Array
     */
    public children: Set<Fragment<Node, Element, TagOptions>>;
    public lastChild: Fragment<Node, Element, TagOptions> | undefined = undefined;

    protected runner: Runner<Node, Element, TagOptions>;

    protected constructor(input: T, runner: Runner<Node, Element, TagOptions>) {
        super(input);
        this.runner = runner;
        this.children = runner.debugUi ? new SetModel() : new Set();
    }

    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    protected pushNode(node: Fragment<Node, Element, TagOptions>): void {
        node.parent = this;
        this.lastChild = node;
        this.children.add(node);
    }

    /**
     * Find the first node in the element if so exists
     * @return {?Element}
     * @protected
     */
    protected findFirstChild(): Node | Element | undefined {
        let first: Node | Element | undefined;

        for (const child of this.children) {
            first = child.findFirstChild();

            if (first) {
                break;
            }
        }

        return first;
    }

    /**
     * Append a node to end of element
     * @param node {Node} node to insert
     */
    public abstract appendNode(node: Node): void;

    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param cb {function (TextNode)} Callback if previous is slot name
     */
    public text(text: unknown): void {
        const node = this.runner.textNode(text);

        this.pushNode(node);
        node.compose();
    }

    public debug(text: IValue<unknown>) {
        const node = this.runner.debugNode(text);

        this.pushNode(node);
        node.compose();
    }

    /**
     * Defines a tag element
     * @param tagName {String} the tag name
     * @param input
     * @param cb {function(Tag, *)} callback
     */
    public tag(tagName: string, input: TagOptions, cb?: (ctx: Tag<Node, Element, TagOptions>) => void): void {
        const tag = this.runner.tag(tagName, input, cb);

        this.pushNode(tag);
        tag.compose();
    }

    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     */
    public create<T extends Fragment<Node, Element, TagOptions>>(node: T, callback?: (ctx: T) => void): void {
        this.pushNode(node);
        node.compose();
        callback?.(node);
    }

    /**
     * Defines an if node
     * @param cond {IValue} condition
     * @param cb {function(Fragment)} callback to run on true
     * @return {this}
     */
    public if(cond: IValue<unknown>, cb: (node: Fragment<Node, Element, TagOptions>) => void) {
        const node = new SwitchedNode(this.runner);

        this.pushNode(node);
        node.addCase(this.case(cond, cb));
    }

    public else(cb: (node: Fragment<Node, Element, TagOptions>) => void) {
        if (this.lastChild instanceof SwitchedNode) {
            this.lastChild.addCase(this.default(cb));
        } else {
            throw userError("wrong `else` function use", "logic-error");
        }
    }

    public elif(cond: IValue<unknown>, cb: (node: Fragment<Node, Element, TagOptions>) => void) {
        if (this.lastChild instanceof SwitchedNode) {
            this.lastChild.addCase(this.case(cond, cb));
        } else {
            throw userError("wrong `elif` function use", "logic-error");
        }
    }

    /**
     * Create a case for switch
     * @param cond {IValue<boolean>}
     * @param cb {function(Fragment) : void}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    public case(
        cond: IValue<unknown>,
        cb: (node: Fragment<Node, Element, TagOptions>) => void,
    ): { cond: IValue<unknown>; cb: (node: Fragment<Node, Element, TagOptions>) => void } {
        return { cond, cb };
    }

    /**
     * @param cb {(function(Fragment) : void)}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    public default(cb: (node: Fragment<Node, Element, TagOptions>) => void): {
        cond: IValue<boolean>;
        cb: (node: Fragment<Node, Element, TagOptions>) => void;
    } {
        return { cond: trueIValue, cb };
    }

    public destroy() {
        this.children.forEach(child => child.destroy());

        this.children.clear();
        this.lastChild = undefined;
        super.destroy();
    }
}

export class Fragment<Node, Element, TagOptions extends object, T extends object = object> extends Root<
    Node,
    Element,
    TagOptions,
    T
> {
    public readonly name?: string;
    public parent!: Root<Node, Element, TagOptions>;

    public constructor(input: T, runner: Runner<Node, Element, TagOptions>, name?: string) {
        super(input, runner);
        this.name = name;
    }
    /**
     * Next node
     * @type {?Fragment}
     */
    protected next?: Fragment<Node, Element, TagOptions>;

    /**
     * Previous node
     * @type {?Fragment}
     */
    protected prev?: Fragment<Node, Element, TagOptions>;

    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    protected pushNode(node: Fragment<Node, Element, TagOptions>): void {
        if (this.lastChild) {
            this.lastChild.next = node;
        }
        node.prev = this.lastChild;

        super.pushNode(node);
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

    public compose() {
        // do nothing
        // to override it
    }

    insertBefore(node: Fragment<Node, Element, TagOptions>) {
        node.prev = this.prev;
        node.next = this;

        if (this.prev) {
            this.prev.next = node;
        }
        this.prev = node;
    }

    insertAfter(node: Fragment<Node, Element, TagOptions>) {
        node.prev = this;
        node.next = this.next;

        this.next = node;
    }

    remove() {
        if (this.next) {
            this.next.prev = this.prev;
        }
        if (this.prev) {
            this.prev.next = this.next;
        }
        this.parent.children.delete(this);
    }

    public destroy() {
        if (this.parent.lastChild === this) {
            this.parent.lastChild = this.prev;
        }
        super.destroy();
    }
}

const trueIValue = new Reference(true);

export interface TextProps {
    text: unknown;
}

/**
 * Represents a text node
 * @class TextNode
 * @extends Fragment
 */
export abstract class TextNode<Node, Element, TagOptions extends object> extends Fragment<
    Node,
    Element,
    TagOptions,
    TextProps
> {
    protected handler: ((v: unknown) => void) | null;

    protected constructor(input: TextProps, runner: Runner<Node, Element, TagOptions>) {
        super(input, runner, ":text");
    }

    public abstract compose(): void;

    protected abstract findFirstChild(): Node;

    public destroy(): void {
        const text = this.input.text;

        if (text instanceof IValue && this.handler) {
            text.off(this.handler);
        }

        super.destroy();
    }
}

/**
 * Vasille node which can manipulate an element node
 * @class INode
 * @extends Fragment
 */
export abstract class INode<Node, Element, TagOptions extends object> extends Fragment<
    Node,
    Element,
    TagOptions,
    TagOptions
> {
    /**
     * The element of vasille node
     * @type Element
     */
    protected node: Element;

    public get element(): Element {
        return this.node;
    }

    public insertAdjacent(node: Node): void {
        this.runner.insertBefore(node, this.node);
    }

    protected abstract applyOptions(options: TagOptions): void;
}

/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
export abstract class Tag<Node, Element, TagOptions extends object> extends INode<Node, Element, TagOptions> {
    protected constructor(input: TagOptions, runner: Runner<Node, Element, TagOptions>, tagName: string) {
        super(input, runner, tagName);
    }

    public abstract compose(): void;

    protected findFirstChild(): Node | Element | undefined {
        return this.node;
    }

    public appendNode(node: Node): void {
        this.runner.appendChild(this.node, node);
    }
}

/**
 * Defines a node which can switch its children conditionally
 */
export class SwitchedNode<Node, Element, TagOptions extends object> extends Fragment<Node, Element, TagOptions> {
    /**
     * Index of current true condition
     * @type number
     */
    private index: number;

    /**
     * Array of possible cases
     * @type {Array<{cond : IValue<unknown>, cb : function(Fragment)}>}
     */
    private cases: { cond: IValue<unknown>; cb: (node: Fragment<Node, Element, TagOptions>) => void }[] = [];

    /**
     * A function that syncs index and content will be bounded to each condition
     * @type {Function}
     */
    private sync: () => void;

    /**
     * Constructs a switch node and define a sync function
     */
    public constructor(runner: Runner<Node, Element, TagOptions>) {
        super({}, runner, ":switch");

        this.sync = () => {
            let i = 0;

            for (; i < this.cases.length; i++) {
                if (this.cases[i].cond.$) {
                    break;
                }
            }

            if (i === this.index) {
                return;
            }

            if (this.lastChild) {
                this.lastChild.destroy();
                this.children.clear();
                this.lastChild = undefined;
            }

            if (i !== this.cases.length) {
                this.index = i;
                this.createChild(this.cases[i].cb);
            } else {
                this.index = -1;
            }
        };
    }

    public addCase(case_: { cond: IValue<unknown>; cb: (node: Fragment<Node, Element, TagOptions>) => void }) {
        this.cases.push(case_);
        case_.cond.on(this.sync);
        this.sync();
    }

    /**
     * Creates a child node
     * @param cb {function(Fragment)} Call-back
     */
    public createChild(cb: (node: Fragment<Node, Element, TagOptions>) => void) {
        const node = new Fragment({}, this.runner, ":case");

        node.parent = this;
        this.lastChild = node;
        this.children.add(node);

        cb(node);
    }

    public destroy() {
        this.cases.forEach(c => {
            c.cond.off(this.sync);
        });
        this.cases.splice(0);

        super.destroy();
    }
}

export interface DebugProps {
    text: IValue<unknown>;
}

/**
 * Represents a debug node
 * @class DebugNode
 * @extends Fragment
 */
export abstract class DebugNode<Node, Element, TagOptions extends object> extends Fragment<
    Node,
    Element,
    TagOptions,
    DebugProps
> {
    protected handler: ((v: unknown) => void) | null;

    protected constructor(input: DebugProps, runner: Runner<Node, Element, TagOptions>) {
        super(input, runner, ":debug");
    }

    public abstract compose(): void;

    public destroy(): void {
        if (this.handler) {
            this.input.text.off(this.handler);
        }

        super.destroy();
    }
}
