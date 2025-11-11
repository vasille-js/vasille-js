import { IValue } from "../core/ivalue.js";
import { TextProps } from "../node/node.js";
import { IRunner } from "../node/runner.js";
import { Runner, Tag, TagOptions, TextNode } from "../runner/web/runner.js";
import { DevValue, Inspector, Position, provideId, toDevId, toDevIdOrValue, toDevObject } from "./inspectable.js";
import { DevExpression, DevReference } from "./state.js";

export interface DevTagOptions extends TagOptions {
    usage?: Position;
}

export class PositionedText {
    text: unknown;
    position: Position;
}

class DevTextNode extends TextNode<DevTagOptions> {
    public readonly id: number;
    public readonly usage: Position;
    public readonly inspector: Inspector;

    public constructor(input: TextProps, runner: DevRunner, usage: Position, inspector: Inspector) {
        super(input, runner);
        this.id = provideId();
        this.usage = usage;
        this.inspector = inspector;

        inspector.createNode({
            id: this.id,
            text: toDevIdOrValue(input.text),
        });
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
        super.destroy();
    }

    public compose(): void {
        super.compose();
        Object.defineProperty(this.node, "vasille", { value: this.usage, configurable: false, enumerable: false });
    }
}

class DevTag extends Tag<DevTagOptions> {
    public readonly id: number;
    public readonly usage: Position;
    public readonly inspector: Inspector;

    declare public runner: DevRunner;

    public constructor(
        options: DevTagOptions,
        runner: DevRunner,
        tagName: string,
        usage: Position,
        inspector: Inspector,
    ) {
        super(options, runner, tagName);

        this.id = provideId();
        this.usage = usage;
        this.inspector = inspector;

        inspector.createTag({
            id: this.id,
            tagName: tagName,
            position: usage,
            callback: options.k && toDevIdOrValue(options.k),
            attr: options.a && toDevObject(options.a),
            class:
                options.c &&
                options.c.map(item => {
                    if (typeof item === "string") {
                        return item;
                    }
                    if (item instanceof DevReference || item instanceof DevExpression) {
                        return item.id;
                    }
                    if (item instanceof IValue) {
                        return JSON.stringify(item.V);
                    }

                    const obj: { [k: string]: number | DevValue } = {};

                    for (const key in item) {
                        obj[key] = toDevIdOrValue(item[key]);
                    }

                    return obj;
                }),
            style:
                options.s &&
                Object.entries(options.s).reduce(
                    (obj, [key, value]) => {
                        return {
                            ...obj,
                            [key]:
                                typeof value === "number"
                                    ? `${value}px`
                                    : value instanceof Array
                                      ? value.map(v => `${v}px`).join(" ")
                                      : typeof value === "string"
                                        ? value
                                        : (toDevId(value) ?? ""),
                        };
                    },
                    {} as { [k: string]: number | string },
                ),
            events:
                options.e &&
                Object.entries(options.e).reduce(
                    (obj, [key, value]) => {
                        return { ...obj, [key]: toDevIdOrValue(value) };
                    },
                    {} as { [k: string]: number | DevValue },
                ),
            bind:
                options.b &&
                Object.entries(options.b).reduce(
                    (obj, [key, value]) => {
                        return { ...obj, [key]: toDevIdOrValue(value) };
                    },
                    {} as { [k: string]: number | DevValue },
                ),
        });
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
    }

    public compose(): void {
        super.compose();
        Object.defineProperty(this.element, "vasille", { value: this.usage, configurable: false, enumerable: false });
    }
}

export class DevRunner extends Runner<DevTagOptions> {
    public readonly inspector: Inspector;

    public constructor(document: Document, inspector: Inspector) {
        super(document);
        this.inspector = inspector;
    }

    public textNode(text: unknown): DevTextNode {
        if (!(text instanceof PositionedText)) {
            throw new Error("Dev build is broken");
        }

        return new DevTextNode({ text: text.text }, this, text.position, this.inspector);
    }

    public tag(tagName: string, input: DevTagOptions, cb?: ((ctx: DevTag) => void) | undefined): DevTag {
        if (!input.usage) {
            throw new Error("Dev build is broken");
        }
        if (cb) {
            input.l = cb;
        }

        return new DevTag(input, this, tagName, input.usage, this.inspector);
    }
}
