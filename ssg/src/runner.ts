import type { TagOptions as WebTagOptions } from "vasille/web-runner";
import {
    TextNode as AbstractTextNode,
    DebugNode as AbstractDebugNode,
    Tag as AbstractTag,
    Runner as IRunner,
    IValue,
} from "vasille";
import escapeHTML from "escape-html";

export type TagOptions = Omit<WebTagOptions, "slot" | "events" | "callback"> & {
    slot?(ctx: Tag): void;
};

export abstract class Node {
    public readonly children: Node[] = [];
    public parent: Node | null = null;

    public insertBefore(node: Node, before: Node) {
        const index = this.children.indexOf(before);

        if (index >= 0) {
            this.children.splice(index, 0, node);
        }
    }

    public appendChild(node: Node) {
        node.parent = this;
        this.children.push(node);
    }

    public abstract toHTML(level: number): string;

    protected level(level: number) {
        return "\t".repeat(level ?? 0);
    }
}

export class RawContentNode extends Node {
    public readonly lines: string[];

    public constructor(lines: string[]) {
        super();
        this.lines = lines;
    }

    public toHTML(level: number): string {
        const prefix = this.level(level);

        return this.lines.map(line => prefix + line).join("\n");
    }
}

export class Text extends Node {
    public readonly text: unknown | IValue<unknown>;

    public constructor(text: unknown | IValue<unknown>) {
        super();
        this.text = text;
    }

    public toHTML(level: number): string {
        const text = (this.text instanceof IValue ? this.text.V : this.text) ?? "";

        return escapeHTML(`${this.level(level)}${text}\n`);
    }
}

export class Comment extends Text {
    public toHTML(level: number): string {
        const text = `${(this.text instanceof IValue ? this.text.V : this.text) ?? ""}`
            .replace("-->", "- ->")
            .replace("<!--", "<!- -");

        return `${this.level(level)}<!-- ${text} -->\n`;
    }
}

export class Element extends Node {
    public readonly name: string;
    public readonly options: TagOptions;

    public constructor(name: string, options: TagOptions) {
        super();
        this.name = name;
        this.options = options;
    }

    public toHTML(level: number): string {
        const attrs: Record<string, string | number> = {};

        if (this.options.attr) {
            for (const [name, value] of Object.entries(this.options.attr)) {
                const extracted = value instanceof IValue ? value.V : value;

                if (typeof extracted === "string" || typeof extracted === "number") {
                    attrs[name] = extracted;
                } else if (extracted) {
                    attrs[name] = "";
                }
            }
        }
        if (this.options.class) {
            const classes: string[] = [];

            for (const item of this.options.class) {
                if (item instanceof IValue) {
                    classes.push(item.V);
                } else if (typeof item === "string") {
                    classes.push(item);
                } else {
                    for (const [name, value] of Object.entries(item)) {
                        const enabled = value instanceof IValue ? value.V : value;

                        if (enabled) {
                            classes.push(name);
                        }
                    }
                }
            }

            attrs.class = classes.join(" ");
        }
        if (this.options.style) {
            const styles: string[] = [];

            for (const [name, value] of Object.entries(this.options.style)) {
                const extracted = value instanceof IValue ? value.V : value;

                if (extracted instanceof Array) {
                    styles.push(`${name}: ${extracted.map(n => `${n}px`).join(" ")}`);
                } else if (typeof extracted === "number") {
                    styles.push(`${name}: ${extracted}px`);
                } else {
                    styles.push(`${name}: ${extracted}`);
                }
            }

            attrs.style = styles.join("; ");
        }

        const attrStr = Object.entries(attrs)
            .map(([name, attr]) => {
                return attr === "" ? name : `${name}="${escapeHTML(`${attr}`)}"`;
            })
            .join(" ");

        return this.children.length === 0
            ? `${this.level(level)}<${this.name} ${attrStr}/>`
            : [
                  `${this.level(level)}<${this.name} ${attrStr}>`,
                  ...this.children.map(item => item.toHTML(level + 1)),
                  `${this.level(level)}</${this.name}>`,
              ].join("\n");
    }
}

export class TextNode extends AbstractTextNode<Node, Element, TagOptions> {
    protected node: Text;

    public compose() {
        this.node = new Text(this.data);
    }

    protected findFirstChild(): Node {
        return this.node;
    }
}

export class DebugNode extends AbstractDebugNode<Node, Element, TagOptions> {
    protected node: Text;

    public compose() {
        this.node = new Comment(this.data);
    }

    protected findFirstChild(): Node | Element | undefined {
        return this.node;
    }
}

export class Tag extends AbstractTag<Node, Element, TagOptions> {
    protected node: Element;

    public compose() {
        this.node = new Element(this.name, this.options);
        this.parent.appendNode(this.node);
    }

    protected applyOptions(options: TagOptions) {}
}

export class Runner implements IRunner<Node, Element, TagOptions> {
    debugUi: boolean = false;

    head: Element;
    body: Element;

    public constructor(head: Element, body: Element) {
        this.head = head;
        this.body = body;
    }

    insertBefore(node: Node, before: Node | Element): void {
        const { parent } = before;

        /* istanbul ignore else */
        if (parent) {
            parent.insertBefore(node, before);
        }
    }

    appendChild(node: Element, child: Node | Element): void {
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
