import type { TagOptions as WebTagOptions } from "vasille/web-runner";
import { TextNode as AbstractTextNode, Tag as AbstractTag, Runner as IRunner, IValue } from "vasille";
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
    public abstract toMarkDown(supportHtml: boolean): string;

    protected level(level: number) {
        return "\t".repeat(level);
    }
}

// @ts-expect-error
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

    public toText() {
        return (this.text instanceof IValue ? this.text.V : this.text) ?? "";
    }
    public toHTML(level: number): string {
        const text = this.toText();

        return escapeHTML(`${this.level(level)}${text}`);
    }
    public toMarkDown(supportHtml: boolean): string {
        return this.toText();
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

    public processAttrs() {
        const attrs: Record<string, string | number> = {};

        if (this.options.a) {
            for (const [name, value] of Object.entries(this.options.a)) {
                const extracted = value instanceof IValue ? value.V : value;

                if (typeof extracted === "string" || typeof extracted === "number") {
                    attrs[name] = extracted;
                } else if (extracted) {
                    attrs[name] = "";
                }
            }
        }

        return attrs;
    }

    public processStyles() {
        const styles: string[] = [];
        const attrValue = this.options.a?.style;

        /* istanbul ignore else */
        if (typeof attrValue === "string") {
            styles.push(attrValue);
        }

        if (this.options.s) {
            for (const [name, value] of Object.entries(this.options.s)) {
                const extracted = value instanceof IValue ? value.V : value;

                if (extracted instanceof Array) {
                    styles.push(`${name}: ${extracted.map(n => `${n}px`).join(" ")}`);
                } else if (typeof extracted === "number") {
                    styles.push(`${name}: ${extracted}px`);
                } else {
                    styles.push(`${name}: ${extracted}`);
                }
            }
        }

        return styles.join("; ");
    }

    public toHTML(level: number): string {
        const attrs: Record<string, string | number> = this.processAttrs();

        if (this.options.c) {
            const classes: string[] = [];
            const attrValue = this.options.a?.class;

            if (typeof attrValue === "string") {
                classes.push(attrValue);
            }

            for (const item of this.options.c) {
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
        if (this.options.s) {
            attrs.style = this.processStyles();
        }

        const attrStr = this.attrString(attrs);

        if (this.children.length === 0) {
            return `${this.level(level)}<${this.name}${attrStr}/>`;
        }

        let prevWasText = false;
        let result: string[] = [`${this.level(level)}<${this.name}${attrStr}>\n`];

        this.children.forEach(item => {
            const currentIsText = item instanceof Text;
            const content = currentIsText
                ? item.toHTML(!prevWasText ? level + 1 : 0)
                : (prevWasText ? "\n" : "") + item.toHTML(level + 1) + "\n";

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
    public toMarkDown(supportHtml: boolean): string {
        const children = (fn = (v: string, _index: number) => v) => {
            return this.children.map((item, index) => fn(item.toMarkDown(supportHtml), index)).join("");
        };
        const attrs = this.options.a ?? {};
        const headingId = () => {
            if (attrs.id) {
                return ` {#${attrs.id}}`;
            }
            return "";
        };

        switch (this.name.toLowerCase()) {
            case "h1":
                console.log(children(), headingId());
                return `\n# ${children()}${headingId()}\n`;

            case "h2":
                return `\n## ${children()}${headingId()}\n`;

            case "h3":
                return `\n### ${children()}${headingId()}\n`;

            case "b":
                return `**${children()}**`;

            case "i":
                return `*${children()}*`;

            case "blockquote":
                return `\n> ${children().replace("\n", "\n> ")}\n`;

            case "pre":
                return `\n\`\`\`\n${children()}\n\`\`\``;

            case "code":
                return `\`${children()}\``;

            case "ol":
                return `\n${children((v, index) => `\n${index + 1}. ${v}`)}`;

            case "ul":
                return `\n${children((v, index) => `\n- ${v}`)}`;

            case "hr":
                return `\n---\n`;

            case "a":
                return `[${children()}](${attrs.href})`;

            case "img":
                return `![${attrs.alt}](${attrs.src})`;

            case "dt":
                return `\n\n${children()}`;

            case "dd":
                return `\n: ${children()}`;

            case "del":
                return `~~${children()}~~`;

            case "mark":
                return `==${children()}==`;

            case "sub":
                return `~${children()}~`;

            case "sup":
                return `^${children()}^`;

            case "input":
                if (attrs.type === "checkbox") {
                    return `[${attrs.checked ? "x" : " "}] `;
                }
                break;

            case "p":
            case "article":
            case "aside":
            case "details":
            case "header":
            case "footer":
            case "main":
            case "nav":
            case "section":
            case "summary":
                return `\n\n${children()}\n\n`;

            case "table": {
                let head = this.children.find(child => {
                    return child instanceof Element && child.name.toLowerCase() === "thead";
                });
                let body = this.children.find(child => {
                    return child instanceof Element && child.name.toLowerCase() === "tbody";
                });
                let firstChild = head?.children[0] ?? this.children[0];
                const firstChildIsTr = firstChild instanceof Element && firstChild.name.toLowerCase() === "tr";

                if (firstChildIsTr) {
                    const number = firstChild.children.length;
                    const headRows = head?.toMarkDown(supportHtml);
                    const bodyRows = body
                        ? body.toMarkDown(supportHtml)
                        : this.children
                              .slice(1)
                              .map(item => item.toMarkDown(supportHtml))
                              .join("");
                    const separator = "\n" + "| - ".repeat(number) + "|";

                    return `\n${headRows ?? separator}${separator}${bodyRows}`;
                }
                break;
            }

            case "thead":
            case "tbody":
                return children();

            case "tr":
                return `\n| ${children().trim()}`;

            case "th":
            case "td":
                return `${children()} | `;

            case "br":
                return "\n\n";

            case "body":
                return children();
        }

        if (supportHtml) {
            const attrs = this.processAttrs();
            const styles = this.processStyles();

            if (styles) {
                attrs.style = styles;
            }

            return `<${this.name}${this.attrString(attrs)}>${children()}</${this.name}>`;
        }

        return children();
    }

    protected attrString(attrs: Record<string, string | number>) {
        const string = Object.entries(attrs)
            .map(([name, attr]) => {
                return attr === "" ? name : `${name}="${escapeHTML(`${attr}`).replace(/"/g, "&quot;")}"`;
            })
            .join(" ");

        return string ? " " + string : string;
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
            this.node.options[key] = this.options[key];
        }
        this.applyOptions(this.options);
    }
}

export class Runner implements IRunner<Node, Element, TagOptions> {
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
