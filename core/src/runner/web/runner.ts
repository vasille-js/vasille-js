import { TextNode as AbstractTextNode, Tag as AbstractTag, Runner as IRunner, IValue, safe } from "../../index.js";
import { internalError } from "../../core/errors.js";
import { AttributeBinding } from "./binding/attribute.js";
import { addClass, DynamicalClassBinding, removeClass, StaticClassBinding } from "./binding/class.js";
import { PropertyBinding } from "./binding/property.js";
import { stringifyStyleValue, StyleBinding } from "./binding/style.js";

export type AttrType<T> = IValue<T | string | null> | T | string | null | undefined;
export type StyleType<T> = T | number | number[] | IValue<string | number | number[]>;

export interface TagOptions {
    /** attributes */
    a?: Record<string, AttrType<number | boolean>>;
    /** classes */
    c?: (string | IValue<string> | Record<string, boolean | IValue<boolean>>)[];
    /** style */
    s?: Record<string, StyleType<string>>;
    /** events */
    e?: Record<string, ((...args: unknown[]) => unknown) | [(...args: unknown[]) => unknown, object | boolean]>;
    /** bindings */
    b?: Record<string, any>;
    /** slot */
    l?: (ctx: Tag<typeof this, Runner<typeof this>>) => void;
    /** callback */
    k?: (node: Element) => void;
}

export class TextNode<Options extends TagOptions, RunnerT extends Runner<Options>> extends AbstractTextNode<
    Node,
    Element,
    Options,
    RunnerT
> {
    protected node!: Text;

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

    public override destroy() {
        this.node.remove();
        super.destroy();
    }

    protected findFirstChild(): Node {
        return this.node;
    }
}

export class Tag<Options extends TagOptions, RunnerT extends Runner<Options>> extends AbstractTag<
    Node,
    Element,
    Options,
    RunnerT
> {
    public compose(): void {
        if (!this.name) {
            throw internalError("wrong Tag constructor call");
        }

        const node = this.runner.document.createElement(this.name);

        this.node = node;
        this.applyOptions(this.options);
        this.parent.appendNode(node);
        this.options.l?.(this);
        this.options.k?.(this.node);
    }

    public override destroy() {
        this.node.remove();
        super.destroy();
    }

    protected applyOptions(options: TagOptions): void {
        const { node } = this;

        if (options.a) {
            for (const name in options.a) {
                const value = options.a[name];

                if (value instanceof IValue) {
                    this.bind(new AttributeBinding(this, name, value));
                } else {
                    /* istanbul ignore else */
                    if (typeof value === "boolean") {
                        /* istanbul ignore else */
                        if (value) {
                            node.setAttribute(name, "");
                        }
                    } else if (value !== null && value !== undefined) {
                        node.setAttribute(name, `${value}`);
                    }
                }
            }
        }

        if (options.c) {
            options.c.forEach(item => {
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

        if (options.s && node instanceof HTMLElement) {
            for (const name in options.s) {
                const value = options.s[name];

                if (value instanceof IValue) {
                    this.bind(new StyleBinding(this, name, value));
                } else {
                    node.style.setProperty(name, stringifyStyleValue(value));
                }
            }
        }

        if (options.e) {
            for (const name in options.e) {
                const event = options.e[name];
                const handler = event instanceof Array ? event : ([event, {}] as const);

                node.addEventListener(
                    name,
                    safe(ev => handler[0](ev, node)),
                    handler[1],
                );
            }
        }

        if (options.b) {
            for (const k in options.b) {
                const value = options.b[k];

                if (!(value instanceof IValue)) {
                    (node as unknown as Record<string, unknown>)[k] = value;
                } else {
                    (node as unknown as Record<string, unknown>)[k] = value.V;
                    this.bind(new PropertyBinding(this, k, value));
                }
            }
        }

        // @ts-expect-error
        node.$vasille = this;
    }
}

export class Runner<Options extends TagOptions> implements IRunner<Node, Element, Options> {
    public readonly document: Document;

    public constructor(document: Document) {
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
    textNode(text: unknown): AbstractTextNode<Node, Element, Options> {
        return new TextNode({ text }, this);
    }
    tag(
        tagName: string,
        input: Options,
        cb?: ((ctx: AbstractTag<Node, Element, Options>) => void) | undefined,
    ): AbstractTag<Node, Element, Options> {
        if (cb) {
            input.l = cb;
        }

        return new Tag(input, this, tagName);
    }
}
