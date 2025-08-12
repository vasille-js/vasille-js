import {
    TextNode as AbstractTextNode,
    DebugNode as AbstractDebugNode,
    Tag as AbstractTag,
    Runner as IRunner,
    IValue,
} from "../../index.js";
import { internalError } from "../../core/errors.js";
import { AttributeBinding } from "./binding/attribute.js";
import { addClass, DynamicalClassBinding, removeClass, StaticClassBinding } from "./binding/class.js";
import { PropertyBinding } from "./binding/property.js";
import { stringifyStyleValue, StyleBinding } from "./binding/style.js";

export type AttrType<T> = IValue<T | string | null> | T | string | null | undefined;
export type StyleType<T> = T | number | number[] | IValue<string | number | number[]>;

export interface TagOptions {
    attr?: Record<string, AttrType<number | boolean>>;
    class?: (string | IValue<string> | Record<string, boolean | IValue<boolean>>)[];
    style?: Record<string, StyleType<string>>;
    events?: Record<string, (...args: unknown[]) => unknown>;
    bind?: Record<string, any>;
    slot?: (ctx: Tag) => void;
    callback?: (node: Element) => void;
}

export class TextNode extends AbstractTextNode<Node, Element, TagOptions> {
    declare public readonly runner: Runner;
    protected node: Text;

    public compose(): void {
        const text = this.data;

        this.node = this.runner.document.createTextNode((text instanceof IValue ? text.V : text)?.toString() ?? "");

        if (text instanceof IValue) {
            this.handler = (v: unknown) => {
                this.node.replaceData(0, -1, v?.toString() ?? "");
            };
            text.on(this.handler);
        }
        this.parent.appendNode(this.node);
    }

    public destroy() {
        this.node.remove();
        super.destroy();
    }

    protected findFirstChild(): Node {
        return this.node;
    }
}

export class DebugNode extends AbstractDebugNode<Node, Element, TagOptions> {
    declare public readonly runner: Runner;
    protected node: Comment;

    public compose(): void {
        const text = this.data;

        this.node = this.runner.document.createComment(text.V?.toString() ?? "");
        this.handler = (v: unknown) => {
            this.node.replaceData(0, -1, v?.toString() ?? "");
        };
        text.on(this.handler);
        this.parent.appendNode(this.node);
    }

    public destroy() {
        this.node.remove();
        super.destroy();
    }

    protected findFirstChild(): Node | Element | undefined {
        return this.node;
    }
}

export class Tag extends AbstractTag<Node, Element, TagOptions> {
    declare public readonly runner: Runner;

    public compose(): void {
        if (!this.name) {
            throw internalError("wrong Tag constructor call");
        }

        const node = this.runner.document.createElement(this.name);

        this.node = node;
        this.applyOptions(this.options);
        this.parent.appendNode(node);
        this.options.callback?.(this.node);
        this.options.slot?.(this);
    }

    public destroy() {
        this.node.remove();
        super.destroy();
    }

    protected applyOptions(options: TagOptions): void {
        if (options.attr) {
            for (const name in options.attr) {
                const value = options.attr[name];

                if (value instanceof IValue) {
                    this.bind(new AttributeBinding(this, name, value));
                } else {
                    /* istanbul ignore else */
                    if (typeof value === "boolean") {
                        /* istanbul ignore else */
                        if (value) {
                            this.node.setAttribute(name, "");
                        }
                    } else if (value !== null && value !== undefined) {
                        this.node.setAttribute(name, `${value}`);
                    }
                }
            }
        }

        if (options.class) {
            options.class.forEach(item => {
                if (item instanceof IValue) {
                    this.bind(new DynamicalClassBinding(this, item));
                } else if (typeof item == "string") {
                    addClass(this, item);
                } else {
                    for (const name in item) {
                        const value = item[name];

                        if (value instanceof IValue) {
                            this.bind(new StaticClassBinding(this, name, value));
                        } else if (value) {
                            addClass(this, name);
                        } else {
                            removeClass(this, name);
                        }
                    }
                }
            });
        }

        if (options.style && this.node instanceof HTMLElement) {
            for (const name in options.style) {
                const value = options.style[name];

                if (value instanceof IValue) {
                    this.bind(new StyleBinding(this, name, value));
                } else {
                    this.node.style.setProperty(name, stringifyStyleValue(value));
                }
            }
        }

        if (options.events) {
            for (const name in options.events) {
                this.node.addEventListener(name, options.events[name]);
            }
        }

        if (options.bind) {
            const node = this.node;

            for (const k in options.bind) {
                const value = options.bind[k];

                if (!(value instanceof IValue)) {
                    node[k] = value;
                } else {
                    node[k] = value.V;
                    this.bind(new PropertyBinding(this, k, value));
                }
            }
        }
    }
}

export class Runner implements IRunner<Node, Element, TagOptions> {
    public readonly debugUi: boolean;
    public readonly document: Document;

    public constructor(debugUi: boolean, document: Document) {
        this.debugUi = debugUi;
        this.document = document;
    }

    insertBefore(node: Node, before: Element | Node): void {
        const parent = before.parentElement;

        /* istanbul ignore else */
        if (parent) {
            parent.insertBefore(node, before);
        }
    }
    appendChild(node: Element, child: Element | Node): void {
        node.appendChild(child);
    }
    textNode(text: unknown): AbstractTextNode<Node, Element, TagOptions> {
        return new TextNode({ text }, this);
    }
    debugNode(text: IValue<unknown>): AbstractDebugNode<Node, Element, TagOptions> {
        return new DebugNode({ text }, this);
    }
    tag(
        tagName: string,
        input: TagOptions,
        cb?: ((ctx: AbstractTag<Node, Element, TagOptions>) => void) | undefined,
    ): AbstractTag<Node, Element, TagOptions> {
        if (cb) {
            input.slot = cb;
        }

        return new Tag(input, this, tagName);
    }
}
