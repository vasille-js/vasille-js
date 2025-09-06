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

        /* istanbul ignore else */
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
        return "\t".repeat(level);
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

    public isEmpty() {
        return !this.text || (this.text instanceof IValue && !this.text.V);
    }

    public toHTML(level: number): string {
        const text = (this.text instanceof IValue ? this.text.V : this.text) ?? "";

        return escapeHTML(`${this.level(level)}${text}`);
    }
}

export class Comment extends Node {
    public readonly model: IValue<unknown>;

    public constructor(model: IValue<unknown>) {
        super();
        this.model = model;
    }

    public toHTML(level: number): string {
        const text = `${this.model.V ?? ""}`.replace("-->", "- ->").replace("<!--", "<!- -");

        return `${this.level(level)}<!-- ${text} -->`;
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
            const attrValue = this.options.attr?.class;

            if (typeof attrValue === "string") {
                classes.push(attrValue);
            }

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
            const attrValue = this.options.attr?.style;

            /* istanbul ignore else */
            if (typeof attrValue === "string") {
                styles.push(attrValue);
            }

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

        if (this.children.length === 0) {
            return `${this.level(level)}<${this.name}${attrStr ? " " + attrStr : ""}/>`;
        }

        let prevWasText = false;
        let result: string[] = [`${this.level(level)}<${this.name}${attrStr ? " " + attrStr : ""}>\n`];

        this.children.forEach(item => {
            const currentIsText = item instanceof Text;
            const content = currentIsText
                ? item.toHTML(!prevWasText ? level + 1 : 0)
                : (prevWasText && !currentIsText ? "\n" : "") + item.toHTML(level + 1) + "\n";

            if (!(item instanceof Text && item.isEmpty())) {
                prevWasText = currentIsText;
                result.push(content);
            }
        });
        if (prevWasText) {
            result.push("\n");
        }
        result.push(`${this.level(level)}</${this.name}>`);

        return result.join("");
    }
}

export class TextNode extends AbstractTextNode<Node, Element, TagOptions> {
    protected node: Text;

    public compose() {
        this.node = new Text(this.data);
        this.parent.appendNode(this.node);
    }

    protected findFirstChild(): Node {
        return this.node;
    }
}

export class DebugNode extends AbstractDebugNode<Node, Element, TagOptions> {
    protected node: Comment;

    public compose() {
        this.node = new Comment(this.data);
        this.parent.appendNode(this.node);
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
        this.applyOptions(this.options);
    }

    protected applyOptions(options: TagOptions) {
        options.slot?.(this);
    }
}

class HeadTag extends Tag {
    public readonly runner: Runner;

    public compose(): void {
        this.node = this.runner.head;
        this.applyOptions(this.options);
    }
}

class BodyTag extends Tag {
    public readonly runner: Runner;

    public compose(): void {
        this.node = this.runner.body;
        for (const key in this.options) {
            this.node.options[key] = this.options[key]
        }
        this.applyOptions(this.options);
    }
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

        return tagName === "head"
            ? new HeadTag(input, this, tagName)
            : tagName === "body"
              ? new BodyTag(input, this, tagName)
              : new Tag(input, this, tagName);
    }
}
