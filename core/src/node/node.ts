import { Reactive, stack, unstack } from "../core/core";
import { IValue } from "../core/ivalue";
import { reportError } from "../functional/safety";
import { Reference } from "../value/reference";
import { Expression } from "../value/expression";
import { AttributeBinding } from "../binding/attribute";
import { StaticClassBinding, DynamicalClassBinding } from "../binding/class";
import { stringifyStyleValue, StyleBinding } from "../binding/style";
import { internalError, userError } from "../core/errors";
import { AttrType, FragmentOptions, TagOptions } from "../functional/options";
import { AcceptedTagsMap } from "../spec/react";
import { config } from "../core/config";

/**
 * This class is symbolic
 * @extends Reactive
 */
export class Fragment<T extends FragmentOptions = FragmentOptions> extends Reactive {
    /**
     * The children list
     * @type Array
     */
    public children: Set<Fragment> = new Set();
    public lastChild: Fragment | undefined = undefined;

    /**
     * Parent node
     * @type {Fragment}
     */
    protected parent: Fragment;

    /**
     * Next node
     * @type {?Fragment}
     */
    protected next?: Fragment;

    /**
     * Previous node
     * @type {?Fragment}
     */
    protected prev?: Fragment;

    /**
     * Constructs a Vasille Node
     * @param input
     */
    public constructor(input: T) {
        super(input);
    }

    /**
     * Prepare to init fragment
     * @param app {AppNode} app of node
     * @param parent {Fragment} parent of node
     * @param data {*} additional data
     */
    public preinit(parent: Fragment, data?: unknown) {
        this.parent = parent;
    }

    init(): void {
        super.init();
        this.ready();
    }

    protected compose(input: T): void {
        input.slot && input.slot(this);
    }

    /** To be overloaded: ready event handler */
    public ready() {
        // empty
    }

    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    protected pushNode(node: Fragment): void {
        if (this.lastChild) {
            this.lastChild.next = node;
        }
        node.prev = this.lastChild;

        this.lastChild = node;
        this.children.add(node);
    }

    /**
     * Find first node in element if so exists
     * @return {?Element}
     * @protected
     */
    protected findFirstChild(): Node | undefined {
        let first: Node | undefined;

        this.children.forEach(child => {
            first = first || child.findFirstChild();
        });

        return first;
    }

    /**
     * Append a node to end of element
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
            child.parentElement?.insertBefore(node, child);
        } else if (this.next) {
            this.next.insertAdjacent(node);
        } else {
            this.parent.appendNode(node);
        }
    }

    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param cb {function (TextNode)} Callback if previous is slot name
     */
    public text(text: unknown, cb?: (text: TextNode) => void): void {
        const node = new TextNode({});

        node.preinit(this, text);
        this.pushNode(node);

        cb && cb(node);
    }

    public debug(text: IValue<unknown>) {
        if (config.debugUi) {
            const node = new DebugNode({});

            node.preinit(this, text);
            this.pushNode(node);
        }
    }

    /**
     * Defines a tag element
     * @param tagName {String} the tag name
     * @param input
     * @param cb {function(Tag, *)} callback
     */
    public tag<K extends keyof AcceptedTagsMap>(
        tagName: K,
        input: TagOptionsWithSlot<K>,
        cb?: (node: Tag<K>) => void,
    ): void {
        const node = new Tag(input);

        input.slot = cb || input.slot;
        node.preinit(this, tagName);
        node.init();
        this.pushNode(node);
        node.ready();
    }

    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     */
    public create<T extends Fragment>(node: T, callback?: T["input"]["slot"]): void {
        node.preinit(this);
        node.input.slot = callback || node.input.slot;
        this.pushNode(node);
        node.init();
    }

    public runFunctional<F extends (...args: any) => any>(f: F, ...args: Parameters<F>): ReturnType<F> | undefined {
        let result: ReturnType<F> | undefined;

        stack(this);
        try {
            result = f(...args);
        } catch (e) {
            reportError(e);
        }
        unstack();

        return result;
    }

    /**
     * Defines an if node
     * @param cond {IValue} condition
     * @param cb {function(Fragment)} callback to run on true
     * @return {this}
     */
    public if(cond: IValue<unknown>, cb: (node: Fragment) => void) {
        const node = new SwitchedNode();

        node.preinit(this);
        node.init();
        this.pushNode(node);
        node.addCase(this.case(cond, cb));
        node.ready();
    }

    public else(cb: (node: Fragment) => void) {
        if (this.lastChild instanceof SwitchedNode) {
            this.lastChild.addCase(this.default(cb));
        } else {
            throw userError("wrong `else` function use", "logic-error");
        }
    }

    public elif(cond: IValue<unknown>, cb: (node: Fragment) => void) {
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
        cb: (node: Fragment) => void,
    ): { cond: IValue<unknown>; cb: (node: Fragment) => void } {
        return { cond, cb };
    }

    /**
     * @param cb {(function(Fragment) : void)}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    public default(cb: (node: Fragment) => void): {
        cond: IValue<boolean>;
        cb: (node: Fragment) => void;
    } {
        return { cond: trueIValue, cb };
    }

    insertBefore(node: Fragment) {
        node.prev = this.prev;
        node.next = this;

        if (this.prev) {
            this.prev.next = node;
        }
        this.prev = node;
    }

    insertAfter(node: Fragment) {
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
    }

    public destroy() {
        this.children.forEach(child => child.destroy());

        this.children.clear();
        this.lastChild = undefined;

        if (this.parent.lastChild === this) {
            this.parent.lastChild = this.prev;
        }
        super.destroy();
    }
}

const trueIValue = new Reference(true);

/**
 * Represents a text node
 * @class TextNode
 * @extends Fragment
 */
export class TextNode extends Fragment {
    #node: Text;

    public preinit(parent: Fragment, text?: unknown) {
        super.preinit(parent);

        if (!text) {
            throw internalError("wrong TextNode::preninit call");
        }

        this.#node = document.createTextNode(text instanceof IValue ? text.$ : text);

        if (text instanceof IValue) {
            this.register(
                new Expression((v: string) => {
                    this.#node.replaceData(0, -1, v);
                }, text),
            );
        }
        this.parent.appendNode(this.#node);
    }

    protected findFirstChild(): Node {
        return this.#node;
    }

    public destroy(): void {
        this.#node.remove();
        super.destroy();
    }
}

/**
 * Vasille node which can manipulate an element node
 * @class INode
 * @extends Fragment
 */
export class INode<T extends TagOptions<any> = TagOptions<any>> extends Fragment<T> {
    /**
     * Defines if node is unmounted
     * @type {boolean}
     */
    protected unmounted = false;

    /**
     * The element of vasille node
     * @type Element
     */
    protected node: Element;

    public get element(): Element {
        return this.node;
    }

    /**
     * Bind attribute value
     * @param name {String} name of attribute
     * @param value {IValue} value
     */
    public attr(name: string, value: IValue<string | number | boolean | null | undefined>): void {
        this.register(new AttributeBinding(this, name, value));
    }

    /**
     * Set attribute value
     * @param name {string} name of attribute
     * @param value {string} value
     */
    public setAttr(name: string, value: string | number | boolean | null | undefined): this {
        if (typeof value === "boolean") {
            if (value) {
                this.node.setAttribute(name, "");
            }
        } else if (value !== null && value !== undefined) {
            this.node.setAttribute(name, `${value}`);
        }
        return this;
    }

    /**
     * Adds a CSS class
     * @param cl {string} Class name
     */
    public addClass(cl: string): this {
        this.node.classList.add(cl);
        return this;
    }

    /**
     * Adds some CSS classes
     * @param cl {string} classes names
     */
    public removeClass(cl: string): this {
        this.node.classList.remove(cl);
        return this;
    }

    /**
     * Bind a CSS class
     * @param className {IValue}
     */
    public bindClass(className: IValue<string>): this {
        this.register(new DynamicalClassBinding(this, className));
        return this;
    }

    /**
     * Bind a floating class name
     * @param cond {IValue} condition
     * @param className {string} class name
     */
    public floatingClass(cond: IValue<boolean>, className: string): this {
        this.register(new StaticClassBinding(this, className, cond));
        return this;
    }

    /**
     * Defines a style attribute
     * @param name {String} name of style attribute
     * @param value {IValue} value
     */
    public style(name: string, value: IValue<string | number | number[]>): this {
        if (this.node instanceof HTMLElement) {
            this.register(new StyleBinding(this, name, value));
        } else {
            throw userError("style can be applied to HTML elements only", "non-html-element");
        }
        return this;
    }

    /**
     * Sets a style property value
     * @param prop {string} Property name
     * @param value {string} Property value
     */
    public setStyle(prop: string, value: string | number | number[]): this {
        if (this.node instanceof HTMLElement) {
            this.node.style.setProperty(prop, stringifyStyleValue(value));
        } else {
            throw userError("Style can be set for HTML elements only", "non-html-element");
        }
        return this;
    }

    /**
     * Add a listener for an event
     * @param name {string} Event name
     * @param handler {function (Event)} Event handler
     * @param options {Object | boolean} addEventListener options
     */
    public listen(name: string, handler: (ev: Event) => void, options?: boolean | AddEventListenerOptions): this {
        this.node.addEventListener(name, handler, options);
        return this;
    }

    public insertAdjacent(node: Node) {
        this.node.parentNode?.insertBefore(node, this.node);
    }

    /**
     * A v-show & ngShow alternative
     * @param cond {IValue} show condition
     */
    public bindShow(cond: IValue<unknown>) {
        const node = this.node;

        if (node instanceof HTMLElement) {
            let lastDisplay = node.style.display;
            const htmlNode: HTMLElement = node;

            return this.bindAlive(
                cond,
                () => {
                    lastDisplay = htmlNode.style.display;
                    htmlNode.style.display = "none";
                },
                () => {
                    htmlNode.style.display = lastDisplay;
                },
            );
        } else {
            throw userError("the element must be a html element", "bind-show");
        }
    }

    /**
     * bind HTML
     * @param value {IValue}
     */
    public bindDomApi(name: string, value: IValue<string>) {
        const node = this.node;

        if (node instanceof HTMLElement) {
            node[name] = value.$;
            this.watch((v: string) => {
                node[name] = v;
            }, value);
        } else {
            throw userError("HTML can be bound for HTML nodes only", "dom-error");
        }
    }

    protected applyAttrs(attrs: Record<string, AttrType<number | boolean>>) {
        for (const name in attrs) {
            const value = attrs[name];

            if (value instanceof IValue) {
                this.attr(name, value);
            } else {
                this.setAttr(name, value);
            }
        }
    }

    protected applyStyle(style: Record<string, string | number | number[] | IValue<string | number | number[]>>) {
        for (const name in style) {
            const value = style[name];

            if (value instanceof IValue) {
                this.style(name, value);
            } else if (typeof value === "string") {
                this.setStyle(name, value);
            } else {
                if (value[0] instanceof IValue) {
                    this.style(
                        name,
                        this.expr(v => v + value[1], value[0]),
                    );
                } else {
                    this.setStyle(name, value[0] + value[1]);
                }
            }
        }
    }

    protected applyBind(bind: Record<string, any>) {
        const inode = this.node;

        for (const k in bind) {
            const value = bind[k];

            if (!(value instanceof IValue)) {
                inode[k] = value;
                return;
            }

            if (k === "value" && (inode instanceof HTMLInputElement || inode instanceof HTMLTextAreaElement)) {
                inode.oninput = () => (value.$ = inode.value);
            } else if (k === "checked" && inode instanceof HTMLInputElement) {
                inode.oninput = () => (value.$ = inode.checked);
            } else if (k === "volume" && inode instanceof HTMLMediaElement) {
                inode.onvolumechange = () => (value.$ = inode.volume);
            }

            this.bindDomApi(k, value);
        }
    }

    protected applyOptions(options: T) {
        options.attr && this.applyAttrs(options.attr);
        options.attrX && this.applyAttrs(options.attrX);

        options.class &&
            options.class.forEach(item => {
                if (item instanceof IValue) {
                    this.bindClass(item);
                } else if (typeof item == "string") {
                    this.addClass(item);
                } else {
                    for (const name in item) {
                        const value = item[name];

                        if (value instanceof IValue) {
                            this.floatingClass(value, name);
                        } else if (value && name !== "$") {
                            this.addClass(name);
                        } else {
                            this.removeClass(name);
                        }
                    }
                }
            });

        options.style && this.applyStyle(options.style);
        options.styleX && this.applyStyle(options.styleX);

        if (options.events) {
            for (const name of Object.keys(options.events)) {
                this.listen(name, options.events[name]);
            }
        }

        options.bind && this.applyBind(options.bind);
        options.bindX && this.applyBind(options.bindX);
    }
}

export interface TagOptionsWithSlot<K extends keyof AcceptedTagsMap> extends TagOptions<K> {
    slot?: (tag: Tag<K>) => void;
    callback?: (node: Element) => void;
}

/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
export class Tag<K extends keyof AcceptedTagsMap> extends INode<TagOptionsWithSlot<K>> {
    public constructor(input: TagOptionsWithSlot<K>) {
        super(input);
    }

    public preinit(parent: Fragment, tagName?: string) {
        if (!tagName || typeof tagName !== "string") {
            throw internalError("wrong Tag::preinit call");
        }

        const node = document.createElement(tagName);

        super.preinit(parent);
        this.node = node;

        this.parent.appendNode(node);
    }

    protected compose(input: TagOptionsWithSlot<K>): void {
        input.slot?.(this);
        input.callback?.(this.node);
    }

    protected findFirstChild(): Node | undefined {
        return this.unmounted ? undefined : this.node;
    }

    public insertAdjacent(node: Node) {
        if (this.unmounted) {
            if (this.next) {
                this.next.insertAdjacent(node);
            } else {
                this.parent.appendNode(node);
            }
        } else {
            super.insertAdjacent(node);
        }
    }

    public appendNode(node: Node) {
        this.node.appendChild(node);
    }

    public extent(options: TagOptions<K>) {
        this.applyOptions(options);
    }

    /**
     * Mount/Unmount a node
     * @param cond {IValue} show condition
     */
    public bindMount(cond: IValue<unknown>) {
        this.bindAlive(
            cond,
            () => {
                this.node.remove();
                this.unmounted = true;
            },
            () => {
                if (this.unmounted) {
                    this.insertAdjacent(this.node);
                    this.unmounted = false;
                }
            },
        );
    }

    /**
     * Runs GC
     */
    public destroy() {
        this.node.remove();
        super.destroy();
    }
}
/**
 * Represents a vasille extension node
 * @class Extension
 * @extends INode
 */
export class Extension<T extends TagOptions<any> = TagOptions<any>> extends INode<T> {
    public tag<K extends keyof AcceptedTagsMap>(tagName: K, input: TagOptionsWithSlot<K>): void {
        const parent = this.parent;

        if (parent instanceof Tag && parent.element.tagName === tagName) {
            parent.extent(input);
            input.slot?.(parent);
        }
    }
}

/**
 * Defines a node which can switch its children conditionally
 */
export class SwitchedNode extends Fragment {
    /**
     * Index of current true condition
     * @type number
     */
    #index: number;

    /**
     * Array of possible cases
     * @type {Array<{cond : IValue<unknown>, cb : function(Fragment)}>}
     */
    #cases: { cond: IValue<unknown>; cb: (node: Fragment) => void }[] = [];

    /**
     * A function that syncs index and content will be bounded to each condition
     * @type {Function}
     */
    #sync: () => void;

    /**
     * Constructs a switch node and define a sync function
     */
    public constructor() {
        super({});

        this.#sync = () => {
            let i = 0;

            for (; i < this.#cases.length; i++) {
                if (this.#cases[i].cond.$) {
                    break;
                }
            }

            if (i === this.#index) {
                return;
            }

            if (this.lastChild) {
                this.lastChild.destroy();
                this.children.clear();
                this.lastChild = undefined;
            }

            if (i !== this.#cases.length) {
                this.#index = i;
                this.createChild(this.#cases[i].cb);
            } else {
                this.#index = -1;
            }
        };
    }

    public addCase(case_: { cond: IValue<unknown>; cb: (node: Fragment) => void }) {
        this.#cases.push(case_);
        case_.cond.on(this.#sync);
        this.#sync();
    }

    /**
     * Creates a child node
     * @param cb {function(Fragment)} Call-back
     */
    public createChild(cb: (node: Fragment) => void) {
        const node = new Fragment({});

        node.preinit(this);
        node.init();

        this.lastChild = node;
        this.children.add(node);

        cb(node);
    }

    public ready() {
        this.#cases.forEach(c => {
            c.cond.on(this.#sync);
        });

        this.#sync();
    }

    public destroy() {
        this.#cases.forEach(c => {
            c.cond.off(this.#sync);
        });
        this.#cases.splice(0);

        super.destroy();
    }
}

/**
 * Represents a debug node
 * @class DebugNode
 * @extends Fragment
 */
export class DebugNode extends Fragment {
    #node: Comment;

    public preinit(parent: Fragment, text?: IValue<unknown>) {
        super.preinit(parent);

        if (!text) {
            throw internalError("wrong DebugNode::preninit call");
        }

        this.#node = document.createComment(text.$?.toString() ?? "");

        this.register(
            new Expression((v: unknown) => {
                this.#node.replaceData(0, -1, v?.toString() ?? "");
            }, text),
        );

        this.parent.appendNode(this.#node);
    }

    /**
     * Runs garbage collector
     */
    public destroy(): void {
        this.#node.remove();
        super.destroy();
    }
}
