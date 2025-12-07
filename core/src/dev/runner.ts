import { IValue } from "../core/ivalue.js";
import { TextProps } from "../node/node.js";
import { Runner, Tag, TagOptions, TextNode } from "../runner/web/runner.js";
import {
    IDevRunner,
    Inspector,
    provideId,
    StaticPosition,
    toDevId,
    toDevIdOrValue,
    toDevObject,
    toDevValue,
} from "./inspectable.js";
import { DevExpression, DevReference } from "./state.js";

export interface DevTagOptions extends TagOptions {
    usage?: StaticPosition;
}

export class PositionedText {
    public text: unknown;
    public position: StaticPosition;

    public constructor(text: unknown, position: StaticPosition) {
        this.text = text;
        this.position = position;
    }
}

export function positionedText(text: unknown, position: StaticPosition) {
    return new PositionedText(text, position);
}

class DevTextNode extends TextNode<DevTagOptions, DevRunner> {
    public readonly id: number;

    public constructor(input: TextProps, runner: DevRunner, usage: StaticPosition, inspector: Inspector) {
        super(input, runner);
        this.id = provideId();

        inspector.createNode({
            id: this.id,
            time: Date.now(),
            text: toDevIdOrValue(input.text),
            position: usage,
        });
    }

    public destroy(): void {
        this.runner.inspector.destroy({ id: this.id, time: Date.now() });
        super.destroy();
    }

    public compose(): void {
        super.compose();
        Object.defineProperty(this.node, "vasille", { value: this.id, configurable: false, enumerable: false });
    }
}

export function remapObject<Before, After>(
    obj: { [k: string]: Before },
    transform: (v: Before) => After,
): { [k: string]: After } {
    const r: { [k: string]: After } = {};

    for (const key in obj) {
        r[key] = transform(obj[key]);
    }

    return r;
}

class DevTag extends Tag<DevTagOptions, DevRunner> {
    public readonly id: number;

    public constructor(
        options: DevTagOptions,
        runner: DevRunner,
        tagName: string,
        usage: StaticPosition | undefined,
        inspector: Inspector,
    ) {
        super(options, runner, tagName);

        this.id = provideId();

        inspector.createTag({
            id: this.id,
            time: Date.now(),
            tagName: tagName,
            usage: usage,
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

                    return remapObject(item, toDevIdOrValue);
                }),
            style:
                options.s &&
                remapObject(options.s, value => {
                    return typeof value === "number"
                        ? `${value}px`
                        : value instanceof Array
                          ? value.map(v => `${v}px`).join(" ")
                          : typeof value === "string"
                            ? value
                            : (toDevId(value) ?? "");
                }),
            events: options.e && remapObject(options.e, toDevValue),
            bind: options.b && remapObject(options.b, toDevIdOrValue),
        });
    }

    public applyOptions(options: DevTagOptions): void {
        if (options.e) {
            for (const [key, handler] of Object.entries(options.e)) {
                if (handler instanceof Array) {
                    const userHandler = handler[0];

                    handler[0] = ev => {
                        this.runner.inspector.eventTrigger({
                            tagId: this.id,
                            eventName: key,
                            time: Date.now(),
                        });
                        userHandler(ev);
                    };
                } else {
                    options[key] = ev => {
                        this.runner.inspector.eventTrigger({
                            tagId: this.id,
                            eventName: key,
                            time: Date.now(),
                        });
                        handler(ev);
                    };
                }
            }
        }
        super.applyOptions(options);
    }

    public destroy(): void {
        this.runner.inspector.destroy({ id: this.id, time: Date.now() });
        super.destroy();
    }

    public compose(): void {
        super.compose();
        Object.defineProperty(this.element, "vasille", { value: this.id, configurable: false, enumerable: false });
    }
}

export class DevRunner extends Runner<DevTagOptions> implements IDevRunner<Node, Element, DevTagOptions> {
    public readonly inspector: Inspector;

    public constructor(document: Document, inspector: Inspector) {
        super(document);
        this.inspector = inspector;
    }

    public textNode(text: unknown): TextNode<DevTagOptions, DevRunner> {
        if (text instanceof PositionedText) {
            return new DevTextNode({ text: text.text }, this, text.position, this.inspector);
        }

        return new TextNode({ text: text }, this);
    }

    public tag(tagName: string, input: DevTagOptions, cb?: ((ctx: DevTag) => void) | undefined): DevTag {
        if (cb) {
            input.l = cb;
        }

        return new DevTag(input, this, tagName, input.usage, this.inspector);
    }
}
