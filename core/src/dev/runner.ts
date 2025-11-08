import { IValue } from "../core/ivalue.js";
import { TextProps } from "../node/node.js";
import { Runner, Tag, TagOptions, TextNode } from "../runner/web/runner.js";
import { DevValue, Inspector, Position, provideId, toDevId, toDevIdOrValue, toDevObject } from "./inspectable.js";
import { DevExpression, DevReference } from "./state.js";

interface DevTagOptions extends TagOptions {
    usage?: Position;
}

export class PositionedText {
    text: unknown;
    position: Position;
}

class DevTextNode extends TextNode {
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
        })
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
        super.destroy();
    }

    public compose(): void {
        super.compose();
        Object.defineProperty(this.node, "vasille", {value: this.usage, configurable: false, enumerable: false});
    }
}

class DevTag extends Tag {
    public readonly id: number;
    public readonly usage: Position;
    public readonly inspector: Inspector;

    declare public runner: DevRunner;

    public constructor (options: DevTagOptions, runner: DevRunner, tagName: string, usage: Position, inspector: Inspector) {
        super(options, runner, tagName);

        this.id = provideId();
        this.usage = usage;
        this.inspector = inspector;

        inspector.createTag({
            id: this.id,
            tagName: tagName,
            position: usage,
            callback: options.callback && toDevIdOrValue(options.callback),
            attr: options.attr && toDevObject(options.attr),
            class: options.class && options.class.map(item => {
                if (typeof item === "string") {
                    return item;
                }
                if (item instanceof DevReference || item instanceof DevExpression) {
                    return item.id;
                }
                if (item instanceof IValue) {
                    return JSON.stringify(item.V);
                }

                const obj: {[k:string]: number|DevValue} = {};

                for (const key in item) {
                    obj[key] = toDevIdOrValue(item[key]);
                }

                return obj;
            }),
            style: options.style && Object.entries(options.style).reduce((obj, [key, value]) => {
                return {
                    ...obj,
                    [key]: typeof value === "number" ? `${value}px` : value instanceof Array ? value.map(v => `${v}px`).join(" ") : typeof value === "string" ? value : toDevId(value) ?? ''
                }
            }, {} as {[k:string]:number|string}),
            events: options.events && Object.entries(options.events).reduce((obj, [key, value]) => {
                return {...obj, [key]: toDevIdOrValue(value)}
            }, {} as {[k:string]: number|DevValue}),
            bind: options.bind && Object.entries(options.bind).reduce((obj, [key, value]) => {
                return {...obj, [key]: toDevIdOrValue(value)}
            }, {} as {[k:string]: number|DevValue}),
        })
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
    }

    public compose(): void {
        super.compose();
        Object.defineProperty(this.element, "vasille", {value: this.usage, configurable: false, enumerable: false});
    }
}

export class DevRunner extends Runner {
    public readonly inspector: Inspector;

    public constructor(document: Document, inspector: Inspector) {
        super(document);
        this.inspector = inspector;
    }

    public textNode(text: unknown): DevTextNode {
        if (!(text instanceof PositionedText)) {
            throw new Error("Dev build is broken");
        }

        return new DevTextNode({text: text.text}, this, text.position, this.inspector);
    }

    public tag(tagName: string, input: DevTagOptions, cb?: ((ctx: DevTag) => void) | undefined): DevTag {
        if (!input.usage) {
            throw new Error("Dev build is broken");
        }
        if (cb) {
            input.slot = cb;
        }

        return new DevTag(input, this, tagName, input.usage, this.inspector);
    }
}
