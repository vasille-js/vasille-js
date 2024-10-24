import { Reactive } from "../core/core";
import { IValue } from "../core/ivalue";
import { Reference } from "../value/reference";
import { Expression } from "../value/expression";
import { AttributeBinding } from "../binding/attribute";
import { StaticClassBinding, DynamicalClassBinding } from "../binding/class";
import { stringifyStyleValue, StyleBinding } from "../binding/style";
import { internalError, userError } from "../core/errors";
import { AttrType, TagOptions } from "../functional/options";
import { config } from "../core/config";

/**
 * This class is symbolic
 * @extends Reactive
 */
export abstract class Root<T extends object = object> extends Reactive<T> {
    /**
     * The children list
     * @type Array
     */
    public children: Set<Fragment> = new Set();
    public lastChild: Fragment | undefined = undefined;

    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    protected pushNode(node: Fragment): void {
        node.parent = this;
        this.lastChild = node;
        this.children.add(node);
    }

    /**
     * Find the first node in the element if so exists
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
    public abstract appendNode(node: Node): void;

    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param cb {function (TextNode)} Callback if previous is slot name
     */
    public text(text: unknown): void {
        const node = new TextNode({ text });

        this.pushNode(node);
        node.compose();
    }

    public debug(text: IValue<unknown>) {
        if (config.debugUi) {
            const node = new DebugNode({ text });

            this.pushNode(node);
            node.compose();
        }
    }

    /**
     * Defines a tag element
     * @param tagName {String} the tag name
     * @param input
     * @param cb {function(Tag, *)} callback
     */
    public tag(tagName: string, input: TagOptionsWithSlot, cb?: (this: Tag) => void): void {
        const tag = new Tag(input, tagName);

        input.slot = cb || input.slot;
        this.pushNode(tag);
        tag.compose();
    }

    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     */
    public create<T extends Fragment>(node: T, callback?: (this: T) => void): void {
        this.pushNode(node);
        node.compose();
        callback?.call(node);
    }

    /**
     * Defines an if node
     * @param cond {IValue} condition
     * @param cb {function(Fragment)} callback to run on true
     * @return {this}
     */
    public if(cond: IValue<unknown>, cb: (node: Fragment) => void) {
        const node = new SwitchedNode();

        this.pushNode(node);
        node.addCase(this.case(cond, cb));
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

    public destroy() {
        this.children.forEach(child => child.destroy());

        this.children.clear();
        this.lastChild = undefined;
        super.destroy();
    }
}

export class Fragment<T extends object = object> extends Root<T> {
    public readonly name?: string;
    public parent!: Root;

    public constructor(input: T, name?: string) {
        super(input);
        this.name = name;
    }
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
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    protected pushNode(node: Fragment): void {
        if (this.lastChild) {
            this.lastChild.next = node;
        }
        node.prev = this.lastChild;

        super.pushNode(node);
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
            const parent = child.parentElement;
            if (parent) {
                child.parentElement.insertBefore(node, child);
            }
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
        if (this.parent.lastChild === this) {
            this.parent.lastChild = this.prev;
        }
        super.destroy();
    }
}

const trueIValue = new Reference(true);

interface TextProps {
    text: unknown;
}

/**
 * Represents a text node
 * @class TextNode
 * @extends Fragment
 */
export class TextNode extends Fragment<TextProps> {
    private node: Text;

    public constructor(input: TextProps) {
        super(input, ":text");
    }

    public compose() {
        const text = this.input.text;

        this.node = document.createTextNode((text instanceof IValue ? text.$ : text)?.toString() ?? "");

        if (text instanceof IValue) {
            this.register(
                new Expression((v: unknown) => {
                    this.node.replaceData(0, -1, v?.toString() ?? "");
                }, text),
            );
        }
        this.parent.appendNode(this.node);
    }

    protected findFirstChild(): Node {
        return this.node;
    }

    public destroy(): void {
        this.node.remove();
        super.destroy();
    }
}

/**
 * Vasille node which can manipulate an element node
 * @class INode
 * @extends Fragment
 */
export class INode<T extends TagOptions = TagOptions> extends Fragment<T> {
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
    public setAttr(name: string, value: string | number | boolean | null | undefined) {
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
    public addClass(cl: string) {
        this.node.classList.add(cl);
    }

    /**
     * Adds some CSS classes
     * @param cl {string} classes names
     */
    public removeClass(cl: string) {
        this.node.classList.remove(cl);
    }

    /**
     * Bind a CSS class
     * @param className {IValue}
     */
    public bindClass(className: IValue<string>) {
        this.register(new DynamicalClassBinding(this, className));
    }

    /**
     * Bind a floating class name
     * @param cond {IValue} condition
     * @param className {string} class name
     */
    public floatingClass(cond: IValue<boolean>, className: string) {
        this.register(new StaticClassBinding(this, className, cond));
    }

    /**
     * Defines a style attribute
     * @param name {String} name of style attribute
     * @param value {IValue} value
     */
    public style(name: string, value: IValue<string | number | number[]>) {
        if (this.node instanceof HTMLElement) {
            this.register(new StyleBinding(this, name, value));
        } else {
            throw userError("style can be applied to HTML elements only", "non-html-element");
        }
    }

    /**
     * Sets a style property value
     * @param prop {string} Property name
     * @param value {string} Property value
     */
    public setStyle(prop: string, value: string | number | number[]) {
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
    public listen(name: string, handler: (ev: Event) => void, options?: boolean | AddEventListenerOptions) {
        this.node.addEventListener(name, handler, options);
    }

    public insertAdjacent(node: Node) {
        const parent = this.node.parentNode;

        if (parent) {
            parent.insertBefore(node, this.node);
        }
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

            this.register(
                new Expression(cond => {
                    if (cond) {
                        if (htmlNode.style.display === "none") {
                            htmlNode.style.display = lastDisplay;
                        }
                    } else {
                        if (htmlNode.style.display !== "none") {
                            lastDisplay = htmlNode.style.display;
                            htmlNode.style.display = "none";
                        }
                    }
                }, cond),
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
            } else {
                this.setStyle(name, value);
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

            this.bindDomApi(k, value);
        }
    }

    protected applyOptions(options: T) {
        options.attr && this.applyAttrs(options.attr);

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

        if (options.events) {
            for (const name of Object.keys(options.events)) {
                this.listen(name, options.events[name]);
            }
        }

        options.bind && this.applyBind(options.bind);
    }
}

export interface TagOptionsWithSlot extends TagOptions {
    slot?: (this: Tag) => void;
    callback?: (node: Element) => void;
}

/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
export class Tag extends INode<TagOptionsWithSlot> {
    public constructor(input: TagOptionsWithSlot, tagName: string) {
        super(input, tagName);
    }

    public compose() {
        if (!this.name) {
            throw internalError("wrong Tag constructor call");
        }

        const node = document.createElement(this.name);

        this.node = node;
        this.applyOptions(this.input);
        this.parent.appendNode(node);
        this.input.callback?.(this.node);
        this.input.slot?.call(this);
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

    public extent(options: TagOptions) {
        this.applyOptions(options);
    }

    /**
     * Mount/Unmount a node
     * @param cond {IValue} show condition
     */
    public bindMount(cond: IValue<unknown>) {
        this.register(
            new Expression(cond => {
                if (cond) {
                    if (this.unmounted) {
                        this.insertAdjacent(this.node);
                        this.unmounted = false;
                    }
                } else {
                    if (!this.unmounted) {
                        this.node.remove();
                        this.unmounted = true;
                    }
                }
            }, cond),
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
export class Extension extends Fragment {
    public tag(tagName: string, input: TagOptionsWithSlot): void {
        let parent = this.parent;
        const target = tagName.toLowerCase();

        while (parent instanceof Fragment && !(parent instanceof Tag)) {
            parent = parent.parent;
        }
        if (parent instanceof Tag && parent.element.tagName.toLowerCase() === target) {
            parent.extent(input);
            input.slot?.call(parent);
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
    private index: number;

    /**
     * Array of possible cases
     * @type {Array<{cond : IValue<unknown>, cb : function(Fragment)}>}
     */
    private cases: { cond: IValue<unknown>; cb: (node: Fragment) => void }[] = [];

    /**
     * A function that syncs index and content will be bounded to each condition
     * @type {Function}
     */
    private sync: () => void;

    /**
     * Constructs a switch node and define a sync function
     */
    public constructor() {
        super({}, ":switch");

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

    public addCase(case_: { cond: IValue<unknown>; cb: (node: Fragment) => void }) {
        this.cases.push(case_);
        case_.cond.on(this.sync);
        this.sync();
    }

    /**
     * Creates a child node
     * @param cb {function(Fragment)} Call-back
     */
    public createChild(cb: (node: Fragment) => void) {
        const node = new Fragment({}, ":case");

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

interface DebugProps {
    text: IValue<unknown>;
}

/**
 * Represents a debug node
 * @class DebugNode
 * @extends Fragment
 */
export class DebugNode extends Fragment<DebugProps> {
    private node: Comment;

    public constructor(input: DebugProps) {
        super(input, ":debug");
    }

    public compose() {
        const text = this.input.text;

        this.node = document.createComment(text.$?.toString() ?? "");
        this.register(
            new Expression((v: unknown) => {
                this.node.replaceData(0, -1, v?.toString() ?? "");
            }, text),
        );
        this.parent.appendNode(this.node);
    }

    /**
     * Runs garbage collector
     */
    public destroy(): void {
        this.node.remove();
        super.destroy();
    }
}
